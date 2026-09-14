import { createWriteStream } from 'node:fs';
import { mkdir, open, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

type CheckedLink = {
  id: string;
  brand: string;
  groupId: string;
  title: string;
  documentNumber?: string;
  linkKind: 'primary' | 'official';
  url: string;
  localPath?: string;
  ok: boolean;
  isPdf: boolean;
};
type CheckReport = { schemaVersion: number; checkedAt: string; results: CheckedLink[] };
type DiscoveredLink = { url: string; label: string };
type CachedPage = { finalUrl: string; html: string };

const args = process.argv.slice(2);
const option = (name: string, fallback: string) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const positiveNumber = (name: string, fallback: number) => {
  const value = Number(option(name, String(fallback)));
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be a positive number`);
  return value;
};

const reportPath = path.resolve(option('--report', 'reports/cnc-document-links.json'));
const outputRoot = path.resolve(option('--output-root', 'public'));
const resultPath = path.resolve(option('--result', 'reports/cnc-document-downloads.json'));
const manifestPath = path.resolve(option('--manifest', path.join(outputRoot, 'downloads/cnc-documents/manifest.json')));
const concurrency = Math.floor(positiveNumber('--concurrency', 3));
const timeoutMs = positiveNumber('--timeout-ms', 120_000);
const maxBytes = positiveNumber('--max-mb', 250) * 1024 * 1024;
const maxHtmlBytes = positiveNumber('--max-html-mb', 12) * 1024 * 1024;
const maxDepth = Math.floor(positiveNumber('--max-depth', 3));
const maxVisits = Math.floor(positiveNumber('--max-visits', 32));
const limit = Math.floor(positiveNumber('--limit', Number.MAX_SAFE_INTEGER));
const idFilter = option('--id', '');
const dryRun = args.includes('--dry-run');
const overwrite = args.includes('--overwrite');
const directOnly = args.includes('--direct-only');
const userAgent = 'ElecioDocumentChecker/1.0 (+https://elecio.co)';
const pageCache = new Map<string, CachedPage>();
const cookies = new Map<string, string>();

const destinationFor = (localPath: string) => {
  const relative = localPath.replace(/^\/+/, '').split('/').join(path.sep);
  const destination = path.resolve(outputRoot, relative);
  const relativeToRoot = path.relative(outputRoot, destination);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) throw new Error(`Unsafe output path: ${localPath}`);
  return destination;
};

const hasPdfSignature = async (filename: string) => {
  try {
    const handle = await open(filename, 'r');
    try {
      const bytes = Buffer.alloc(5);
      await handle.read(bytes, 0, bytes.length, 0);
      return bytes.toString('ascii') === '%PDF-';
    } finally { await handle.close(); }
  } catch { return false; }
};

const compact = (input: string) => {
  let value = input;
  try { value = decodeURIComponent(value); } catch { /* Preserve malformed source text. */ }
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
};
const plainText = (value: string) => value
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&').replace(/&quot;|&#34;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, ' ').trim();

const safeHttpUrl = (raw: string, baseUrl: string) => {
  try {
    if (raw.includes('{{') || raw.includes('}}')) return undefined;
    const cleaned = raw.replace(/&amp;/gi, '&').replace(/\\\//g, '/')
      .replace(/\\u002f/gi, '/').replace(/\\u003a/gi, ':').trim();
    const url = new URL(cleaned, baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.endsWith('.localhost') || /^(127\.|10\.|192\.168\.|169\.254\.)/.test(hostname)) return undefined;
    return url.href;
  } catch { return undefined; }
};

const extractLinks = (html: string, baseUrl: string): DiscoveredLink[] => {
  const found: DiscoveredLink[] = [];
  const add = (raw: string, label = '') => {
    const url = safeHttpUrl(raw, baseUrl);
    if (url) found.push({ url, label: plainText(label) });
  };
  for (const match of html.matchAll(/<a\b([^>]*)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)) add(match[2], match[4]);
  for (const match of html.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>[\s\S]{0,1800}?<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) add(match[2], `${plainText(match[1])} ${plainText(match[3])}`);
  for (const match of html.matchAll(/(?:href|src|action|data-(?:url|href|src|download|file))\s*=\s*["']([^"']+)["']/gi)) add(match[1]);
  for (const match of html.matchAll(/["']((?:https?:)?\\?\/\\?\/[^"'\s<>]+|\/(?:[^"'\s<>]+\.(?:pdf|PDF)(?:\?[^"'\s<>]*)?))["']/g)) add(match[1]);
  for (const match of html.matchAll(/["'](\/[^"'\s<>]*(?:download|pdf)[^"'\s<>]*)["']/gi)) add(match[1]);
  const unique = new Map<string, DiscoveredLink>();
  for (const item of found) {
    const existing = unique.get(item.url);
    if (!existing || item.label.length > existing.label.length) unique.set(item.url, item);
  }
  return [...unique.values()];
};

const rankLinks = (links: DiscoveredLink[], item: CheckedLink, currentUrl: string) => {
  const number = compact(item.documentNumber ?? '');
  const ignored = new Set(['manual', 'download', 'document', 'operator', 'operation', 'programming', 'parameter', 'maintenance', 'connection', 'service', 'official', 'archive']);
  const tokens = `${item.title} ${item.documentNumber ?? ''} ${item.groupId}`.toLowerCase()
    .split(/[^a-z0-9]+/).filter((token) => token.length >= 3 && !ignored.has(token));
  const currentHost = new URL(currentUrl).hostname;
  return links.map((link) => {
    const haystack = compact(`${link.url} ${link.label}`);
    const url = new URL(link.url);
    let score = 0;
    if (/\.pdf(?:$|[?#])/i.test(link.url)) score += 120;
    if (number && haystack.includes(number)) score += 100;
    score += tokens.filter((token) => haystack.includes(compact(token))).length * 9;
    if (/download|pdf|manual/i.test(`${link.url} ${link.label}`)) score += 18;
    if (url.hostname === currentHost) score += 4;
    if (/\.(?:jpg|jpeg|png|gif|svg|webp|css|woff2?|ico)(?:$|[?#])/i.test(link.url)) score -= 200;
    if (/login|sign-?up|privacy|terms|contact|category|tag\//i.test(link.url)) score -= 40;
    return { ...link, score };
  }).filter((link) => link.score >= 18).sort((a, b) => b.score - a.score).slice(0, 14);
};

const rememberCookies = (response: Response) => {
  const hostname = new URL(response.url).hostname;
  const values = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean) as string[];
  if (values.length) cookies.set(hostname, values.map((value) => value.split(';', 1)[0]).join('; '));
};

const fetchToTemporary = async (url: string, temporary: string, referer?: string) => {
  const cached = pageCache.get(url);
  if (cached) return { kind: 'html' as const, ...cached };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const hostname = new URL(url).hostname;
    const response = await fetch(url, {
      redirect: 'follow', signal: controller.signal,
      headers: {
        Accept: 'application/pdf,text/html;q=0.9,*/*;q=0.5',
        'Accept-Language': 'en-US,en;q=0.8', 'User-Agent': userAgent,
        ...(referer ? { Referer: referer } : {}),
        ...(cookies.get(hostname) ? { Cookie: cookies.get(hostname)! } : {}),
      },
    });
    rememberCookies(response);
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status} for ${url}`);
    const declaredLength = Number(response.headers.get('content-length') ?? 0);
    if (declaredLength > maxBytes) throw new Error(`File exceeds --max-mb (${declaredLength} bytes)`);
    let received = 0;
    const source = Readable.fromWeb(response.body as never);
    source.on('data', (chunk: Buffer) => { received += chunk.length; if (received > maxBytes) controller.abort(); });
    await pipeline(source, createWriteStream(temporary, { flags: 'wx' }));
    if (received > maxBytes) throw new Error(`File exceeds --max-mb (${received} bytes)`);
    if (await hasPdfSignature(temporary)) return { kind: 'pdf' as const, bytes: received, finalUrl: response.url };
    if (received > maxHtmlBytes) throw new Error(`Non-PDF response is too large to inspect (${received} bytes)`);
    const html = await readFile(temporary, 'utf8');
    const page = { finalUrl: response.url, html };
    pageCache.set(url, page); pageCache.set(response.url, page);
    await rm(temporary, { force: true });
    return { kind: 'html' as const, ...page };
  } finally { clearTimeout(timer); }
};

const knownCandidates = (url: string) => {
  const parsed = new URL(url);
  const candidates: DiscoveredLink[] = [];
  if (parsed.hostname.endsWith('manualmachine.com') && !parsed.pathname.startsWith('/download/')) candidates.push({ url: new URL(`/download${parsed.pathname}`, parsed).href, label: 'Download PDF' });
  if (parsed.hostname.endsWith('pdfcoffee.com') && !parsed.pathname.startsWith('/download/')) candidates.push({ url: new URL(`/download${parsed.pathname}`, parsed).href, label: 'Download PDF' });
  const studyId = parsed.pathname.match(/^\/doc\/(\d+)/)?.[1];
  if (parsed.hostname.endsWith('studylib.net') && studyId) candidates.push({ url: new URL(`/download/${studyId}`, parsed).href, label: 'Download PDF' });
  return candidates;
};

const download = async (item: CheckedLink) => {
  const destination = destinationFor(item.localPath!);
  if (!overwrite && await hasPdfSignature(destination)) return { id: item.id, status: 'skipped', localPath: item.localPath, destination, bytes: (await stat(destination)).size, sourceUrl: item.url };
  if (dryRun) return { id: item.id, status: 'planned', localPath: item.localPath, destination, bytes: 0, sourceUrl: item.url };
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.part-${process.pid}`;
  const queue = [{ url: item.url, depth: 0, referer: undefined as string | undefined }];
  const visited = new Set<string>();
  const errors: string[] = [];
  try {
    while (queue.length && visited.size < maxVisits) {
      const current = queue.shift()!;
      if (visited.has(current.url) || current.depth > maxDepth) continue;
      visited.add(current.url);
      await rm(temporary, { force: true }).catch(() => undefined);
      try {
        const resource = await fetchToTemporary(current.url, temporary, current.referer);
        if (resource.kind === 'pdf') {
          if (overwrite) await rm(destination, { force: true });
          await rename(temporary, destination);
          return { id: item.id, status: current.url === item.url ? 'downloaded' : 'discovered', localPath: item.localPath, destination, bytes: resource.bytes, sourceUrl: resource.finalUrl, visited: visited.size };
        }
        if (directOnly) throw new Error('Response is a web page (--direct-only is enabled)');
        const links = [...knownCandidates(resource.finalUrl), ...extractLinks(resource.html, resource.finalUrl)];
        for (const link of rankLinks(links, item, resource.finalUrl)) if (!visited.has(link.url)) queue.push({ url: link.url, depth: current.depth + 1, referer: resource.finalUrl });
      } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
    }
    throw new Error(`No matching PDF found after checking ${visited.size} URL(s)${errors.length ? `; last error: ${errors.at(-1)}` : ''}`);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => undefined);
    return { id: item.id, status: 'failed', localPath: item.localPath, destination, bytes: 0, sourceUrl: item.url, visited: visited.size, error: error instanceof Error ? error.message : String(error) };
  }
};

async function main() {
  const report = JSON.parse(await readFile(reportPath, 'utf8')) as CheckReport;
  if (report.schemaVersion !== 1 || !Array.isArray(report.results)) throw new Error('Unsupported or invalid check report');
  const candidates = report.results.filter((item) => item.linkKind === 'primary'
    && item.localPath?.startsWith('/downloads/cnc-documents/')
    && (!idFilter || item.id.includes(idFilter))).slice(0, limit);
  const results: Awaited<ReturnType<typeof download>>[] = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, candidates.length) }, async () => {
    while (cursor < candidates.length) {
      const item = candidates[cursor++];
      const result = await download(item); results.push(result);
      console.log(`[${result.status.toUpperCase()}] ${item.url} -> ${result.destination}`);
    }
  }));
  const summary = {
    checkedAt: report.checkedAt, completedAt: new Date().toISOString(), eligible: candidates.length,
    downloaded: results.filter((item) => item.status === 'downloaded').length,
    discovered: results.filter((item) => item.status === 'discovered').length,
    skipped: results.filter((item) => item.status === 'skipped').length,
    planned: results.filter((item) => item.status === 'planned').length,
    failed: results.filter((item) => item.status === 'failed').length,
    totalBytes: results.reduce((sum, item) => sum + item.bytes, 0),
  };
  await mkdir(path.dirname(resultPath), { recursive: true });
  await writeFile(resultPath, `${JSON.stringify({ summary, results }, null, 2)}\n`, 'utf8');
  if (!dryRun) {
    type ManifestEntry = { id: string; localPath: string; sourceUrl: string; bytes: number; updatedAt: string };
    let existing: { entries?: ManifestEntry[] } = {};
    try { existing = JSON.parse(await readFile(manifestPath, 'utf8')) as { entries?: ManifestEntry[] }; } catch { /* First run. */ }
    const entries = new Map<string, ManifestEntry>();
    for (const entry of existing.entries ?? []) {
      if (entry.localPath?.startsWith('/downloads/cnc-documents/') && await hasPdfSignature(destinationFor(entry.localPath))) entries.set(entry.id, entry);
    }
    const updatedAt = new Date().toISOString();
    for (const result of results) {
      if (!['downloaded', 'discovered', 'skipped'].includes(result.status) || !result.localPath) continue;
      entries.set(result.id, { id: result.id, localPath: result.localPath, sourceUrl: result.sourceUrl, bytes: result.bytes, updatedAt });
    }
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(manifestPath, `${JSON.stringify({ schemaVersion: 1, generatedAt: updatedAt, entries: [...entries.values()].sort((a, b) => a.id.localeCompare(b.id)) }, null, 2)}\n`, 'utf8');
  }
  console.log(`\nResult: ${resultPath}`); console.log(JSON.stringify(summary, null, 2));
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
