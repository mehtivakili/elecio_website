import 'server-only';

import { headers } from 'next/headers';
import { auth } from './config';
import { can, type AppAction, type AppResource, type AppRole, roles } from './rbac';
import { knex } from '@/server/db/knex';

export class AuthenticationRequiredError extends Error {
  readonly status = 401;
  constructor() {
    super('Authentication required');
  }
}

export class AuthorizationDeniedError extends Error {
  readonly status = 403;
  constructor() {
    super('Permission denied');
  }
}

export type Principal = {
  userId: string;
  role: AppRole;
  sessionId: string;
};

export async function getPrincipal(): Promise<Principal | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const profile = await knex('user_profiles')
    .select('role', 'is_active')
    .where('user_id', session.user.id)
    .first();

  if (!profile?.is_active || !roles.includes(profile.role as AppRole)) return null;
  return {
    userId: session.user.id,
    sessionId: session.session.id,
    role: profile.role as AppRole,
  };
}

export async function requirePrincipal(): Promise<Principal> {
  const principal = await getPrincipal();
  if (!principal) throw new AuthenticationRequiredError();
  return principal;
}

export async function requirePermission(
  resource: AppResource,
  action: AppAction,
  relationship: 'own' | 'assigned' | 'all' = 'all'
): Promise<Principal> {
  const principal = await requirePrincipal();
  if (!can(principal.role, resource, action, relationship)) {
    throw new AuthorizationDeniedError();
  }
  return principal;
}
