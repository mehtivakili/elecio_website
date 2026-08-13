import 'server-only';

import { createHmac } from 'node:crypto';
import { Pool } from 'pg';
import { betterAuth } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { phoneNumber, twoFactor } from 'better-auth/plugins';
import { knex } from '@/server/db/knex';
import { redisSecondaryStorage } from '@/server/redis/client';
import { writeAuditEvent } from '@/server/audit/write-audit-event';
import { isIranianMobileNumber, maskPhoneNumber } from './phone';
import {
  hasValidInternalAuthHeader,
  localeForPendingOtp,
} from './customer-flow';
import { getSmsProvider } from '@/server/sms';
import { hasStaffInternalHeader } from './staff-gateway';
import { sendTransactionalEmail } from '@/server/email';
import { strongPassword } from './staff-policy';

declare global {
  var __elecioAuthPool: Pool | undefined;
}

const authPool =
  globalThis.__elecioAuthPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__elecioAuthPool = authPool;
}

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const ipAddressHeaders = (process.env.AUTH_IP_ADDRESS_HEADERS ?? '')
  .split(',')
  .map((header) => header.trim().toLowerCase())
  .filter(Boolean);

function temporaryEmail(phone: string): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters.');
  }

  const digest = createHmac('sha256', secret).update(phone).digest('hex');
  return `phone-${digest}@accounts.elecio.invalid`;
}

export const auth = betterAuth({
  appName: 'Elecio',
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: authPool,
  user: {
    modelName: 'auth_users',
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      twoFactorEnabled: 'two_factor_enabled',
    },
  },
  session: {
    modelName: 'auth_sessions',
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    storeSessionInDatabase: true,
    cookieCache: { enabled: false },
    fields: {
      userId: 'user_id',
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  account: {
    modelName: 'auth_accounts',
    fields: {
      userId: 'user_id',
      accountId: 'account_id',
      providerId: 'provider_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    modelName: 'auth_verifications',
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  secondaryStorage: redisSecondaryStorage,
  rateLimit: {
    enabled: true,
    storage: 'secondary-storage',
    window: 60,
    max: 60,
    customRules: {
      '/phone-number/send-otp': { window: 60, max: 3 },
      '/phone-number/verify': { window: 60, max: 6 },
      '/sign-in/*': { window: 60, max: 6 },
      '/sign-up/*': { window: 60, max: 3 },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookiePrefix: 'elecio',
    database: { generateId: 'uuid' },
    ipAddress: ipAddressHeaders.length > 0 ? { ipAddressHeaders } : undefined,
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 14,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      const profile = await knex('user_profiles').select('role', 'is_active').where('user_id', user.id).first();
      if (!profile?.is_active || !['support', 'editor', 'admin', 'owner'].includes(profile.role)) return;
      await sendTransactionalEmail({ to: user.email, subject: 'Reset your Elecio staff password',
        text: `Reset your password: ${url}`, html: `<p>Reset your Elecio staff password:</p><p><a href="${url}">Reset password</a></p>` });
    },
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (
        (context.path === '/phone-number/send-otp' || context.path === '/phone-number/verify') &&
        !hasValidInternalAuthHeader(context.headers)
      ) {
        throw new APIError('NOT_FOUND');
      }
      if (context.path === '/sign-up/email' && !hasStaffInternalHeader(context.headers)) throw new APIError('NOT_FOUND');
      if (context.path === '/sign-in/email') {
        const email = typeof context.body?.email === 'string' ? context.body.email.trim().toLowerCase() : '';
        const staff = email ? await knex('auth_users as u').join('user_profiles as p', 'p.user_id', 'u.id')
          .select('p.role', 'p.is_active').whereRaw('lower(u.email) = ?', [email]).first() : null;
        if (!staff?.is_active || !['support', 'editor', 'admin', 'owner'].includes(staff.role)) throw new APIError('UNAUTHORIZED');
      }
      if (context.path === '/reset-password' && !strongPassword(String(context.body?.newPassword ?? ''))) throw new APIError('BAD_REQUEST');
    }),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await knex('user_profiles')
            .insert({ user_id: user.id, role: 'customer', locale: 'fa', is_active: true })
            .onConflict('user_id')
            .ignore();
          await writeAuditEvent({
            actorUserId: user.id,
            actorRole: 'customer',
            action: 'identity.created',
            resource: 'user',
            resourceId: user.id,
            outcome: 'success',
          });
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          const profile = await knex('user_profiles').select('role').where('user_id', session.userId).first();
          if (profile && ['support', 'editor', 'admin', 'owner'].includes(profile.role)) {
            await knex('auth_sessions').where({ id: session.id }).update({ expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000) });
          }
          await knex('user_profiles')
            .where('user_id', session.userId)
            .update({ last_login_at: knex.fn.now(), updated_at: knex.fn.now() });
          await writeAuditEvent({
            actorUserId: session.userId,
            action: 'session.created',
            resource: 'session',
            resourceId: session.id,
            outcome: 'success',
          });
        },
      },
      delete: {
        after: async (session) => {
          await writeAuditEvent({
            actorUserId: session.userId,
            action: 'session.revoked',
            resource: 'session',
            resourceId: session.id,
            outcome: 'success',
          });
        },
      },
    },
  },
  plugins: [
    phoneNumber({
      otpLength: 6,
      expiresIn: 120,
      allowedAttempts: 3,
      requireVerification: true,
      phoneNumberValidator: isIranianMobileNumber,
      signUpOnVerification: {
        getTempEmail: temporaryEmail,
        getTempName: maskPhoneNumber,
      },
      schema: {
        user: {
          fields: {
            phoneNumber: 'phone_number',
            phoneNumberVerified: 'phone_number_verified',
          },
        },
      },
      sendOTP: async ({ phoneNumber, code }) => {
        await getSmsProvider().sendOtp({
          phoneNumber,
          code,
          locale: await localeForPendingOtp(phoneNumber),
        });
      },
    }),
    twoFactor({
      issuer: 'Elecio Staff',
      twoFactorTable: 'auth_two_factors',
      twoFactorCookieMaxAge: 5 * 60,
      trustDeviceMaxAge: 0,
      accountLockout: { enabled: true, maxFailedAttempts: 5, durationSeconds: 30 * 60 },
      schema: {
        user: { fields: { twoFactorEnabled: 'two_factor_enabled' } },
        twoFactor: { fields: { userId: 'user_id', backupCodes: 'backup_codes', failedVerificationCount: 'failed_verification_count', lockedUntil: 'locked_until' } },
      },
    }),
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
