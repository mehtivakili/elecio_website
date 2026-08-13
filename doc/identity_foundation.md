# Identity foundation operations

This runbook covers the infrastructure introduced by the 2026-08-13 account/auth addendum,
Expansion Phase 1. It does not enable SMS delivery or customer-facing login UI; those belong to
Expansion Phase 2.

## Required services and secrets

- PostgreSQL from `DATABASE_URL`.
- Redis-compatible storage from `REDIS_URL`. Authentication is deliberately fail-closed without it;
  do not silently fall back to per-process memory in production.
- A unique `BETTER_AUTH_SECRET` containing at least 32 random characters.
- Exact `BETTER_AUTH_URL` and comma-separated `BETTER_AUTH_TRUSTED_ORIGINS`.
- Independent `IP_HASH_SALT`. IP hashes are signals, not stable user identifiers.
- `AUTH_IP_ADDRESS_HEADERS` must remain empty until the production proxy is known and verified to
  overwrite the selected header. Do not trust a client-controlled `x-forwarded-for` value.

Never commit `.env`, provider credentials, Redis credentials, database dumps, OTPs, sessions, or
real customer data. Development, staging, and production need separate credentials and databases.

## Data ownership

- Better Auth: `auth_users`, `auth_sessions`, `auth_accounts`, `auth_verifications`.
- Elecio: `user_profiles`, `user_consents`, `audit_events`, and all business/content tables.
- Roles are stored only in `user_profiles`. Browser-supplied roles are ignored.
- `audit_events` is append-only at PostgreSQL trigger level; update/delete attempts fail.

The migration transaction converts any legacy `admin_users` rows into Better Auth users,
credential accounts, and Elecio profiles, updates post authors to UUID identities, then drops the
legacy password table. Rollback reconstructs it if an emergency rollback is required. Before any
production migration, take a backup and rehearse both directions on a staging copy.

## Deployment sequence

1. Provision isolated PostgreSQL and Redis services and store secrets in the host's secret manager.
2. Restrict both origins to the application network; Redis must require TLS/password when remote.
3. Run `npm run db:migrate` once as a deployment job, not concurrently on every web replica.
4. Verify tables, foreign keys, append-only audit trigger, and migration list.
5. Deploy the application and verify `/api/auth/ok` or the library health response without enabling
   the SMS UI. The phone plugin deliberately throws `SMS_OTP_NOT_CONFIGURED` until Expansion Phase 2.
6. Monitor database/Redis errors and audit insertion failures. Authentication should fail closed.

## Backup, restore, and retention decisions

- Enable encrypted automated PostgreSQL backups and point-in-time recovery if the host supports it.
- Perform a timed restore drill before auth launch and after meaningful schema changes.
- Redis contains revocable session/cache/rate-limit state; it is not the authoritative user store.
  Database session rows remain enabled for attribution and controlled recovery.
- Final retention periods for accounts, consent evidence, audit records, and security signals require
  owner and local legal/privacy approval before public registration launches.

## Phase 1 acceptance checks

- `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` pass.
- Migration applies and rolls back on an isolated/staging database without losing author mapping.
- Only one password/session identity system remains.
- Redis unavailability blocks auth rate-limit/session operations instead of weakening protection.
- Role matrix has automated tests and protected server code uses `requirePermission`.
- No secret, OTP, session token, raw password, or raw IP appears in application/audit logs.
