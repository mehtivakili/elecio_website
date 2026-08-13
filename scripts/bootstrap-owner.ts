import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { knex } from '../src/server/db/knex';

async function main() {
  const email = process.env.BOOTSTRAP_OWNER_EMAIL?.trim().toLowerCase() ?? '';
  const name = process.env.BOOTSTRAP_OWNER_NAME?.trim() ?? '';
  const password = process.env.BOOTSTRAP_OWNER_PASSWORD ?? '';
  const strong = password.length >= 14 && password.length <= 128 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
  if (!/^\S+@\S+\.\S+$/.test(email) || !name || !strong) throw new Error('Set a valid BOOTSTRAP_OWNER_EMAIL, BOOTSTRAP_OWNER_NAME, and strong 14+ character BOOTSTRAP_OWNER_PASSWORD.');
  const existingOwner = await knex('user_profiles').where({ role: 'owner' }).first();
  if (existingOwner) throw new Error('An owner already exists; bootstrap is permanently disabled.');
  const existingUser = await knex('auth_users').whereRaw('lower(email) = ?', [email]).first();
  if (existingUser) throw new Error('That email already belongs to an identity.');
  const userId = randomUUID(); const accountId = randomUUID(); const passwordHash = await hashPassword(password);
  await knex.transaction(async (trx) => {
    await trx('auth_users').insert({ id: userId, name, email, email_verified: true, two_factor_enabled: false, created_at: trx.fn.now(), updated_at: trx.fn.now() });
    await trx('auth_accounts').insert({ id: accountId, user_id: userId, account_id: userId, provider_id: 'credential', password: passwordHash, created_at: trx.fn.now(), updated_at: trx.fn.now() });
    await trx('user_profiles').insert({ user_id: userId, role: 'owner', locale: 'en', is_active: true, created_at: trx.fn.now(), updated_at: trx.fn.now() });
  });
  process.stdout.write('Owner identity created. Delete BOOTSTRAP_OWNER_PASSWORD from the environment and enroll TOTP immediately.\n');
}
main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'Bootstrap failed'}\n`); process.exitCode = 1; }).finally(() => knex.destroy());
