# Staff authentication and admin operations

This runbook covers Expansion Phase 3. Customer authentication remains governed by
`customer_account.md`; the two flows share Better Auth sessions but use separate enrollment and
gateway controls.

## First owner bootstrap

There is no public staff registration and no role can promote itself to owner. After migration 12,
set `BOOTSTRAP_OWNER_EMAIL`, `BOOTSTRAP_OWNER_NAME`, and a unique 14+ character password containing
upper/lowercase Latin characters, a number, and a symbol. Run:

```text
npm run staff:bootstrap-owner
```

The command refuses to run if any owner already exists or the email is already used. Immediately
remove `BOOTSTRAP_OWNER_PASSWORD` and sign in at `/en/admin/login` or `/fa/admin/login`. Never rerun bootstrap or preserve its password in shell
history, CI variables, deployment configuration, or a password manager note shared with the team.

### Local demo administrator

For unfinished local development only, set `NODE_ENV=development` and
`ALLOW_INSECURE_DEV_ADMIN=true`, then run `npm run dev:seed-admin`. This creates the deliberately
weak `admin@admin` / `admin` identity with the `admin` role. It is not an owner and cannot manage
staff or integrations. Normal credential checks, staff authorization, and server-side sessions
still apply. The seeder refuses every non-development environment and refuses to
replace an identity it did not create.

When that exact local-demo mode is enabled and `REDIS_URL` is absent, Better Auth secondary state
uses a process-local TTL store so the unfinished project can be exercised without external Redis.
It is erased on restart, does not provide multi-instance rate-limit guarantees, and is impossible
to activate in production. All normal development, staging, and production modes remain fail-closed
without Redis.

Before sharing or deploying the environment, run `npm run dev:remove-admin`, set
`ALLOW_INSECURE_DEV_ADMIN=false`, and confirm the identity no longer exists. Never copy this account
to staging or production and never weaken the production password or session policy to accommodate it.

## Staff enrollment and recovery

- Only an authenticated, active owner can issue a 48-hour invitation. The database stores SHA-256 of a
  random 256-bit token, not the raw link. A newer invite revokes older pending invites for the email.
- Production uses `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `STAFF_EMAIL_FROM`. Development mode
  sends nothing and returns the invite URL only to the authorized owner UI. Disabled/misconfigured
  email fails closed and removes the unusable invite record.
- Accepting the emailed link proves email control, creates one credential identity, marks the email
  verified, and assigns only the invited support/editor/admin role. Password policy is enforced on
  invite acceptance and reset.
- Password-reset responses are enumeration-resistant, links expire through Better Auth, successful
  reset revokes every session, and only active staff identities receive mail.

## Sessions and authorization

Staff database sessions expire after 12 hours; Better Auth cookies remain HttpOnly, SameSite, and
Secure in production. Login creates server-side sessions. Role, active state,
ownership/assignment, and resource/action permission are checked next to every server
query or mutation. UI navigation is convenience only.

Support sees assigned leads. Editors operate content/media. Admins operate content, customers,
leads, and audit but cannot manage staff or integrations. Only owners invite or modify staff and see
system configuration health. Owner changes reject self-demotion and changes to another owner,
require a session created in the last ten minutes, revoke all target sessions, and create an
append-only audit event. Forbidden object operations return generic forbidden/not-found responses.

## Admin modules

The localized noindex panel provides role-scoped operational counts, assigned contact leads,
post publication state and content inventory, database-linked media inventory, customers, staff and
pending invitations, redacted SMS/email/Redis/auth configuration health, and append-only audit
events. Tables are bounded to 100 or 200 latest rows. No API returns session tokens, secrets, raw IP,
password hashes, or provider keys.

The media module is intentionally read-only until Phase 4 supplies the required signature/MIME/
dimension validation, image re-encoding, object storage, malware controls, variants, and
reference-aware deletion. The Phase 3 post module changes only explicit publication state; rich
editing, revisions, preview tokens, schedules, redirects, and autosave belong to the Phase 4 CMS and
must not be approximated with unsanitized HTML.

## Deployment checklist

1. Back up MySQL and apply migration `20260813000012`; rehearse rollback on a staging copy.
2. Configure unique production auth/IP secrets, HTTPS origin allowlists, Redis, Resend verified
   domain/from-address, proxy IP header trust, email delivery alerts, and CSP.
3. Bootstrap the first owner once, remove bootstrap values, then
   create every other staff identity through invitations.
4. Exercise invite expiry/replay/revocation, invalid/weak credentials, email outage,
   password reset/revocation, session expiry, logout, role change,
   deactivation, assignment boundaries, and every role/resource/action pair in isolated staging.
5. Verify fa/en, 320px mobile, keyboard, focus, screen reader, reduced motion, empty/error/loading
   states, and supported production browsers.
6. Alert on staff login failures, password resets, invitations, role/active changes,
   forbidden bursts, provider outages, and audit-write failures. Review owners and inactive staff
   quarterly and revoke access immediately during offboarding.

The repository cannot prove real Resend delivery or production proxy behavior without deployment
credentials and infrastructure. Those remain release gates.
