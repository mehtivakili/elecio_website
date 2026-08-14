import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from 'objection';
import { ContactSubmission } from '@/server/db/models/ContactSubmission';
import { isRateLimited } from '@/server/services/rate-limit';
import { hashRequestIp } from '@/server/services/ip-hash';
import { auth } from '@/server/auth/config';

// Objection/Knex need real Node APIs (TCP sockets to MySQL) — must not run on the Edge runtime.
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const ipHash = hashRequestIp(request);

  if (isRateLimited(`contact:${ipHash}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Honeypot: a field named "website" that's hidden from real users via CSS. Real submitters
  // never fill it in; bots that auto-fill every field do. Pretend success either way so bots
  // don't learn the check exists.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  try {
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
    const submission = await ContactSubmission.query().insert({
      userId: session?.user.id,
      name: body.name,
      phone: body.phone,
      email: body.email || undefined,
      company: body.company || undefined,
      message: body.message || undefined,
      locale: body.locale === 'en' ? 'en' : 'fa',
      sourcePage: body.sourcePage || undefined,
      persona: body.persona || 'unknown',
      status: 'new',
      ipHash,
    });

    // doc/business_path.md §2 flags lead-routing (email/Telegram/phone) as an open decision —
    // notification dispatch plugs in here once that's answered. Logged for now so nothing is
    // silently lost the way the old site's simulated form lost submissions.
    console.info(`[contact] new submission #${submission.id} (${submission.persona})`);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: 'Invalid input', details: error.data }, { status: 400 });
    }
    console.error('[contact] insert failed', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
