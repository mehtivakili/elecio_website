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
type ManifestEntry = { id: string; localPath: string; sourceUrl: string; bytes: number; updatedAt: string };

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
const sourceHostFilter = option('--source-host', '').toLowerCase();
const dryRun = args.includes('--dry-run');
const overwrite = args.includes('--overwrite');
const directOnly = args.includes('--direct-only');
const manifestOnly = args.includes('--manifest-only');
// Search-engine pages are noisy and can lead to a similarly named but incorrect
// manual. Keep this as an explicit last-resort option; curated vendor URLs below
// are always tried first.
const webSearch = args.includes('--web-search');
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
  const isSearchPage = /(^|\.)(?:bing\.com|duckduckgo\.com)$/.test(currentHost);
  return links.map((link) => {
    const haystack = compact(`${link.url} ${link.label}`);
    const url = new URL(link.url);
    let score = 0;
    if (/\.pdf(?:$|[?#])/i.test(link.url)) score += 120;
    // cncmanual.com exposes the real file through a numbered download page and
    // then a short-lived JavaScript token. These must outrank menus/categories
    // or maxVisits can be exhausted before the actual download is reached.
    if (/cncmanual\.com\/download\/\d+\/?(?:$|[?#])/i.test(link.url)) score += 300;
    if (/[?&]dl=1(?:&|$)/i.test(link.url) && /[?&]token=/i.test(link.url)) score += 500;
    if (number && haystack.includes(number)) score += 100;
    score += tokens.filter((token) => haystack.includes(compact(token))).length * 9;
    if (/download|pdf|manual/i.test(`${link.url} ${link.label}`)) score += 18;
    if (url.hostname === currentHost) score += 4;
    if (/\.(?:jpg|jpeg|png|gif|svg|webp|css|woff2?|ico)(?:$|[?#])/i.test(link.url)) score -= 200;
    if (/login|sign-?up|privacy|terms|contact|category|tag\//i.test(link.url)) score -= 40;
    if (isSearchPage && number && !haystack.includes(number)) score -= 500;
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

const curatedDocumentUrls: Record<string, string[]> = {
  'B-62560E/02': [
    'https://www.star-circuit.com/article/pdf/F15_PARAMETER_MANUAL.pdf',
  ],
  'B-63004EN/02': [
    'https://www.drivesul.com.br/template/imagens/manuais/manuais-fanuc/fanuc-series-16i-18i-21i-model-a/Series%2016i-18i-21i-MODEL%20A%20-Operators%20Manual.pdf',
  ],
  'B-63005EN/02': [
    'https://www.mroelectric.com/static/app/product/pdfs/A02B-0265-C101.pdf',
  ],
  'B-63010EN/02': [
    'https://www.drivesul.com.br/template/imagens/manuais/manuais-fanuc/fanuc-series-16i-18i-21i-model-a/Series%2016i-18i-21i-MODEL%20A%20-%20Parameter%20Manual.pdf',
  ],
  'B-63014EN/02': [
    'https://www.star-circuit.com/article/pdf/FANUC_Series_16i_18i_160i_180i_160is_180isMA_Operator_Manual.pdf',
  ],
  'IB-1501046': [
    'https://www.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1501046/ib1501046engl.pdf',
  ],
  'IB-1500254': [
    'https://dl.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1500254%28eng%29/ib1500254d.pdf',
  ],
  'IB-1501275 / IB-1501276': [
    'https://dl.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1501275%28eng%29/ib1501275-1501276engu.pdf',
  ],
  'IB-1501277 / IB-1501278': [
    'https://dl.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1501277%28eng%29/ib1501277-1501278engt.pdf',
  ],
  'IB-1501279': [
    'https://dl.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1501279%28eng%29/ib1501279engt.pdf',
  ],
  'IB-1501269': [
    'https://dl.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1501269%28eng%29/ib1501269engr.pdf',
  ],
  'IB-1501273': [
    'https://dl.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1501273%28eng%29/ib1501273engm.pdf',
  ],
  'IB-1501270 / IB-1501271': [
    'https://dl.mitsubishielectric.com/dl/fa/document/manual/cnc/ib1501270/ib1501270engm.pdf',
  ],
  '1113513': [
    'https://device.report/m/af21fff7d11e47a5b7a1b1a037e39139c2d26d50f313cf64a5e597b6c6408c21.pdf',
  ],
  '892903 series': [
    'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC640/34059x-16/bhb/892903-2A.pdf',
  ],
  '892909 series': [
    'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC640/34059x-16/diniso/892909-2A.pdf',
  ],
  '1303406 series': [
    'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC640/34059x-16/zyklen_bearbeitung/1303406-21.pdf',
  ],
  '1303409 series': [
    'https://content.heidenhain.de/doku/tnc_guide/pdf_files/TNC640/34059x-16/zyklen_messen/1303409-21.pdf',
  ],
};

const curatedCandidates = (item: CheckedLink) => item.documentNumber
  ? (curatedDocumentUrls[item.documentNumber] ?? [])
  : [];

const siteSearchCandidates = (item: CheckedLink) => {
  if (!item.documentNumber) return [];
  const hostname = new URL(item.url).hostname;
  if (hostname !== 'cncmanual.com') return [];
  // WordPress search performs much better without the revision suffix (/01,
  // /02, ...), while link ranking below still checks the complete number.
  const baseNumber = item.documentNumber.split('/')[0].trim();
  return [`https://cncmanual.com/?s=${encodeURIComponent(baseNumber)}`];
};

const searchCandidates = (item: CheckedLink) => {
  if (!webSearch || !item.documentNumber) return [];
  const query = `"${item.documentNumber}" ${item.brand} ${item.title} filetype:pdf`;
  return [
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
  ];
};

const download = async (item: CheckedLink) => {
  const destination = destinationFor(item.localPath!);
  if (!overwrite && await hasPdfSignature(destination)) return { id: item.id, status: 'skipped', localPath: item.localPath, destination, bytes: (await stat(destination)).size, sourceUrl: item.url };
  if (dryRun) return { id: item.id, status: 'planned', localPath: item.localPath, destination, bytes: 0, sourceUrl: item.url };
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.part-${process.pid}`;
  const sourceCandidate = { url: item.url, depth: 0, referer: undefined as string | undefined };
  const siteCandidates = siteSearchCandidates(item)
    .map((url) => ({ url, depth: 0, referer: undefined as string | undefined }));
  const sourceUrl = new URL(item.url);
  const sourceLooksLikeCollection = sourceUrl.hostname === 'cncmanual.com'
    && sourceUrl.pathname.startsWith('/fanuc/');
  const queue = [
    ...curatedCandidates(item).map((url) => ({ url, depth: 0, referer: undefined as string | undefined })),
    ...(sourceLooksLikeCollection ? [...siteCandidates, sourceCandidate] : [sourceCandidate, ...siteCandidates]),
    ...searchCandidates(item).map((url) => ({ url, depth: 0, referer: undefined as string | undefined })),
  ];
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
        const next = rankLinks(links, item, resource.finalUrl)
          .filter((link) => !visited.has(link.url))
          .map((link) => ({ url: link.url, depth: current.depth + 1, referer: resource.finalUrl }));
        // Follow the best matches immediately. Appending here creates a large
        // breadth-first backlog of menus/assets and can exhaust maxVisits first.
        queue.unshift(...next);
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
    && (!sourceHostFilter || new URL(item.url).hostname.toLowerCase() === sourceHostFilter)
    && (!idFilter || item.id.includes(idFilter))).slice(0, limit);
  const manifestEntries = new Map<string, ManifestEntry>();
  const writeManifest = async () => {
    const temporary = `${manifestPath}.part-${process.pid}`;
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(temporary, `${JSON.stringify({
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      entries: [...manifestEntries.values()].sort((a, b) => a.id.localeCompare(b.id)),
    }, null, 2)}\n`, 'utf8');
    try {
      await rename(temporary, manifestPath);
    } catch (error) {
      if (!(error instanceof Error) || !('code' in error) || !['EEXIST', 'EPERM'].includes(String(error.code))) throw error;
      await rm(manifestPath, { force: true });
      await rename(temporary, manifestPath);
    }
  };

  const recoveredAt = new Date().toISOString();
  for (const item of candidates) {
    const destination = destinationFor(item.localPath!);
    if (!await hasPdfSignature(destination)) continue;
    manifestEntries.set(item.id, {
      id: item.id,
      localPath: item.localPath!,
      sourceUrl: item.url,
      bytes: (await stat(destination)).size,
      updatedAt: recoveredAt,
    });
  }
  if (!dryRun) await writeManifest();
  if (manifestOnly) {
    console.log(`Manifest rebuilt with ${manifestEntries.size} local PDF file(s): ${manifestPath}`);
    return;
  }

  let manifestWriteChain = Promise.resolve();
  const checkpoint = (result: Awaited<ReturnType<typeof download>>) => {
    if (dryRun || !['downloaded', 'discovered', 'skipped'].includes(result.status) || !result.localPath) return Promise.resolve();
    manifestEntries.set(result.id, {
      id: result.id,
      localPath: result.localPath,
      sourceUrl: result.sourceUrl,
      bytes: result.bytes,
      updatedAt: new Date().toISOString(),
    });
    manifestWriteChain = manifestWriteChain.then(writeManifest);
    return manifestWriteChain;
  };
  const results: Awaited<ReturnType<typeof download>>[] = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, candidates.length) }, async () => {
    while (cursor < candidates.length) {
      const item = candidates[cursor++];
      const result = await download(item); results.push(result);
      await checkpoint(result);
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
  console.log(`\nResult: ${resultPath}`); console.log(JSON.stringify(summary, null, 2));
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
