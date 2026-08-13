import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { knex } from '../src/server/db/knex';

const LOGIN_ALIAS = 'admin@admin';
const EMAIL = 'admin@admin.local';
const PASSWORD = 'admin';
const NAME = 'Local Development Admin';

async function main() {
  if (process.env.NODE_ENV !== 'development' || process.env.ALLOW_INSECURE_DEV_ADMIN !== 'true') {
    throw new Error('Refusing: local demo admin requires NODE_ENV=development and ALLOW_INSECURE_DEV_ADMIN=true.');
  }

  const existing = await knex('auth_users as u')
    .leftJoin('user_profiles as p', 'p.user_id', 'u.id')
    .select('u.id', 'u.name', 'p.role')
    .whereRaw('lower(u.email) in (?, ?)', [EMAIL, LOGIN_ALIAS])
    .first();

  if (process.argv[2] === 'remove') {
    if (existing) await knex('auth_users').where({ id: existing.id }).delete();
    process.stdout.write('Local demo admin removed.\n');
    return;
  }

  if (existing && (existing.name !== NAME || !['admin', 'owner'].includes(existing.role))) {
    throw new Error('Refusing to replace an identity not owned by the local demo-admin seeder.');
  }

  const passwordHash = await hashPassword(PASSWORD);
  await knex.transaction(async (trx) => {
    if (existing) {
      await trx('auth_users').where({ id: existing.id }).update({ email: EMAIL, two_factor_enabled: false, updated_at: trx.fn.now() });
      await trx('auth_accounts')
        .where({ user_id: existing.id, provider_id: 'credential' })
        .update({ password: passwordHash, updated_at: trx.fn.now() });
      await trx('user_profiles')
        .where({ user_id: existing.id })
        .update({ role: 'owner', is_active: true, updated_at: trx.fn.now() });
      await trx('auth_two_factors').where({ user_id: existing.id }).delete();
      await trx('auth_sessions').where({ user_id: existing.id }).delete();
      return;
    }

    const userId = randomUUID();
    await trx('auth_users').insert({
      id: userId,
      name: NAME,
      email: EMAIL,
      email_verified: true,
      two_factor_enabled: false,
      created_at: trx.fn.now(),
      updated_at: trx.fn.now(),
    });
    await trx('auth_accounts').insert({
      id: randomUUID(),
      user_id: userId,
      account_id: userId,
      provider_id: 'credential',
      password: passwordHash,
      created_at: trx.fn.now(),
      updated_at: trx.fn.now(),
    });
    await trx('user_profiles').insert({
      user_id: userId,
      role: 'owner',
      locale: 'en',
      is_active: true,
      created_at: trx.fn.now(),
      updated_at: trx.fn.now(),
    });
  });

  process.stdout.write('Local demo admin ready: admin@admin / admin. Development-only MFA bypass is active.\n');
}

main()
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : 'Local demo-admin setup failed'}\n`);
    process.exitCode = 1;
  })
  .finally(() => knex.destroy());
