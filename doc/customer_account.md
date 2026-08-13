# Customer OTP and account operations

This document covers Expansion Phase 2. Identity-table ownership and the Phase 1 deployment order
remain in `identity_foundation.md`.

## Runtime configuration

Customer authentication requires `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, exact
`BETTER_AUTH_TRUSTED_ORIGINS`, Redis, and `IP_HASH_SALT` from `.env.example`. Live delivery also
requires `SMS_PROVIDER=kavenegar`, `KAVENEGAR_API_KEY`, and the approved
`KAVENEGAR_OTP_TEMPLATE`. `SMS_PROVIDER=disabled` fails closed. `development` accepts the server
handoff without sending or exposing the OTP and is rejected in production.

`CUSTOMER_REGISTRATION_ENABLED=false` is the emergency kill switch for new OTP sends and resends.
Existing authenticated sessions continue to work so customers can inspect or revoke them. Never
put provider secrets or a real OTP in source, client state, URLs, analytics, audit metadata, or
logs.

## Security behavior

- Browsers call only `/api/customer-auth/*`; direct Better Auth send/verify routes return 404
  without a server-derived HMAC header.
- The normalized phone is held in a signed, HttpOnly, SameSite=Strict, Secure-in-production flow
  cookie scoped to the customer-auth API. The browser URL contains only an intent UUID and masked
  display value.
- Better Auth owns the two-minute code, three-attempt cap, one-time verification, session rotation,
  and database session. Elecio adds a one-minute resend cooldown, five sends per phone/day, fifteen
  sends per IP/day, and five gateway verification requests per intent/IP/five minutes in shared
  Redis. Redis failure denies the action.
- Mutating customer/account routes require an exact configured Origin. Consent versions are bound
  to the server-created intent and written transactionally only after successful verification.
- Resending creates a new intent and consumes the old one after the provider accepts the handoff.
  Audit records never include a phone, OTP, cookie, token, raw IP, or provider secret.
- Session lists expose a bounded user-agent summary and dates, never tokens or stored IP addresses.
  Session revocation first proves database ownership.

## Account v1

Localized `/login`, `/verify`, `/account`, `/account/profile`, and `/account/security` provide
passwordless first-use registration/sign-in, profile updates, consent visibility, linked support
and download history, revoke-one/others/all, logout, and create/cancel deletion requests. Terms and
privacy pages use version `2026-08-13`; legal counsel must approve their final production wording.

New contact/download records attach to the live user. On successful verification, older anonymous
records with an exact normalized phone variant are claimed; email-only records are deliberately not
guessed or linked.

## Deployment and acceptance

1. Approve legal text, retention/deletion SLA, Kavenegar template, sender, and spend limits.
2. Configure real secrets, HTTPS URL/origins, production Redis, trusted proxy IP headers, provider
   credentials, alerts, and keep the kill switch off until ready.
3. Back up PostgreSQL; apply migrations; verify `otp_intents`, `account_deletion_requests`, and the
   two nullable `user_id` ownership columns. Rehearse rollback on a staging copy.
4. Run test, typecheck, lint, build, dependency audit, and integration tests with isolated
   PostgreSQL/Redis/provider sandbox.
5. Prove success, wrong/expired/replayed OTP, resend invalidation, attempt/send caps, provider
   timeout/outage, origin rejection, session rotation/revocation/logout, record ownership, and kill
   switch behavior. Confirm messages and provider dashboards contain no OTP/PII leakage beyond the
   phone required for delivery.
6. Test fa/en at 320/360/390/430px, keyboard, screen reader, OTP autofill/paste, RTL/LTR, reduced
   motion, offline/slow network, and real iOS/Android SMS delivery before enabling production.

The local implementation cannot prove live Kavenegar delivery, production proxy behavior, legal
approval, or physical-device accessibility. Those remain release gates, not code assumptions.
