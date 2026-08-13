import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from 'objection';
import { DownloadRequest, type DownloadResource } from '@/server/db/models/DownloadRequest';
import { isRateLimited } from '@/server/services/rate-limit';
import { hashRequestIp } from '@/server/services/ip-hash';
import { auth } from '@/server/auth/config';

export const runtime = 'nodejs';

const VALID_RESOURCES: DownloadResource[] = ['catalog_pdf', 'features_pdf', 'windows_installer', 'android_apk'];

export async function POST(request: NextRequest) {
  const ipHash = hashRequestIp(request);

  if (isRateLimited(`download:${ipHash}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Same honeypot convention as /api/contact.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  if (!VALID_RESOURCES.includes(body.resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
  }

  try {
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
    const record = await DownloadRequest.query().insert({
      userId: session?.user.id,
      name: body.name,
      email: body.email,
      phone: body.phone || undefined,
      company: body.company || undefined,
      resource: body.resource,
      locale: body.locale === 'en' ? 'en' : 'fa',
      ipHash,
    });

    console.info(`[download] new request #${record.id} (${record.resource})`);

    // The gate is lead capture, not access control — the URL is returned immediately rather than
    // requiring a second step (e.g. an emailed link), per doc/marketing_path.md §2's
    // reciprocity/micro-commitment framing: ask for the details, then deliver right away.
    return NextResponse.json(
      { ok: true, url: DownloadRequest.resolveResourceUrl(record.resource, record.locale) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: 'Invalid input', details: error.data }, { status: 400 });
    }
    console.error('[download] insert failed', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
