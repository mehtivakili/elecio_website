import { createHash } from 'node:crypto';
import path from 'node:path';
import { stat } from 'node:fs/promises';
import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { isBrandableImagePath } from '@/lib/branded-image';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const outputCache = new Map<string, Uint8Array>();
const MAX_CACHE_ENTRIES = 64;

function responseHeaders(etag: string) {
  return {
    'Content-Type': 'image/webp',
    'Content-Disposition': 'inline; filename="elecio-branded-image.webp"',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
  };
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('src');
  if (!isBrandableImagePath(source)) return new Response('Invalid image path', { status: 400 });

  const publicRoot = path.resolve(process.cwd(), 'public');
  const sourcePath = path.resolve(publicRoot, source.slice(1));
  const logoPath = path.resolve(publicRoot, 'on_image_logo.png');
  if (!sourcePath.startsWith(`${publicRoot}${path.sep}`) || sourcePath === logoPath) {
    return new Response('Invalid image path', { status: 400 });
  }

  try {
    const [sourceStat, logoStat] = await Promise.all([stat(sourcePath), stat(logoPath)]);
    if (!sourceStat.isFile() || !logoStat.isFile() || sourceStat.size > 10 * 1024 * 1024) {
      return new Response('Image unavailable', { status: 404 });
    }
    const cacheKey = `${source}:${sourceStat.size}:${sourceStat.mtimeMs}:${logoStat.size}:${logoStat.mtimeMs}`;
    const etag = `"${createHash('sha256').update(cacheKey).digest('base64url')}"`;
    if (request.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers: responseHeaders(etag) });
    }

    let output = outputCache.get(cacheKey);
    if (!output) {
      const metadata = await sharp(sourcePath).metadata();
      const oriented = metadata.autoOrient;
      const width = oriented.width ?? metadata.width ?? 0;
      const height = oriented.height ?? metadata.height ?? 0;
      if (width < 160 || height < 100 || width > 8000 || height > 8000) {
        return new Response('Unsupported image dimensions', { status: 422 });
      }
      const logoWidth = Math.min(520, Math.max(120, Math.round(width * 0.22)));
      const logo = await sharp(logoPath).resize({ width: logoWidth, kernel: sharp.kernel.lanczos3, withoutEnlargement: true }).png().toBuffer({ resolveWithObject: true });
      const left = Math.max(20, Math.round(width * 0.04));
      const bottom = Math.max(18, Math.round(height * 0.045));
      const top = Math.max(bottom, height - logo.info.height - bottom);
      const branded = await sharp(sourcePath).rotate().composite([{ input: logo.data, left, top }]).webp({ quality: 94, effort: 6, smartSubsample: true }).toBuffer();
      output = new Uint8Array(branded);
      if (outputCache.size >= MAX_CACHE_ENTRIES) outputCache.delete(outputCache.keys().next().value!);
      outputCache.set(cacheKey, output);
    }
    return new Response(output.buffer as ArrayBuffer, { status: 200, headers: responseHeaders(etag) });
  } catch {
    return new Response('Image unavailable', { status: 404 });
  }
}
