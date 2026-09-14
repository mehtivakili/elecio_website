import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { controllerDocumentGroups } from '../src/data/cnc-documents';

type LinkKind = 'primary' | 'official';

type LinkTarget = {
  id: string;
  brand: string;
  groupId: string;
  model: string;
  title: string;
  documentNumber?: string;
  access: string;
  linkKind: LinkKind;
  url: string;
  localPath?: string;
};

type CheckResult = LinkTarget & {
  checkedAt: string;
  ok: boolean;
  isPdf: boolean;
  status?: number;
  finalUrl?: string;
  contentType?: string;
  contentLength?: number;
  elapsedMs: number;
  error?: string;
};

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

const outputPath = path.resolve(option('--output', 'reports/cnc-document-links.json'));
const timeoutMs = positiveNumber('--timeout-ms', 25_000);
const concurrency = Math.floor(positiveNumber('--concurrency', 6));
const strict = args.includes('--strict');

const safeSegment = (value: string) => value
  .normalize('NFKD')
  .replace(/[^a-zA-Z0-9._-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 120) || 'document';

const targets: LinkTarget[] = controllerDocumentGroups.flatMap((group) =>
  group.documents.flatMap((document, documentIndex) => {
    const filename = `${safeSegment(document.documentNumber ?? document.title)}.pdf`;
    const base = {
      brand: group.brand,
      groupId: group.id,
      model: group.model,
      title: document.title,
      documentNumber: document.documentNumber,
      access: document.access,
    };
    const links: LinkTarget[] = [{
      ...base,
      id: `${group.id}:${documentIndex}:primary`,
      linkKind: 'primary',
      url: document.url,
      localPath: `/downloads/cnc-documents/${safeSegment(group.brand)}/${safeSegment(group.id)}/${filename}`,
    }];
    if (document.officialUrl && document.officialUrl !== document.url) {
      links.push({ ...base, id: `${group.id}:${documentIndex}:official`, linkKind: 'official', url: document.officialUrl });
    }
    return links;
  }),
);

const probe = async (url: string) => {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'application/pdf,text/html;q=0.8,*/*;q=0.5',
        Range: 'bytes=0-4095',
        'User-Agent': 'ElecioDocumentChecker/1.0 (+https://elecio.co)',
      },
    });
    const reader = response.body?.getReader();
    let firstBytes = new Uint8Array();
    if (reader) {
      const chunk = await reader.read();
      firstBytes = chunk.value ?? firstBytes;
      await reader.cancel().catch(() => undefined);
    }
    const signature = Buffer.from(firstBytes.subarray(0, 5)).toString('ascii');
    const contentType = response.headers.get('content-type') ?? undefined;
    const rawLength = response.headers.get('content-range')?.split('/').at(-1)
      ?? response.headers.get('content-length');
    const contentLength = rawLength && /^\d+$/.test(rawLength) ? Number(rawLength) : undefined;
    return {
      ok: response.ok,
      isPdf: response.ok && signature === '%PDF-',
      status: response.status,
      finalUrl: response.url,
      contentType,
      contentLength,
      elapsedMs: Date.now() - started,
    };
  } catch (error) {
    return {
      ok: false,
      isPdf: false,
      elapsedMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
};

async function main() {
const uniqueUrls = [...new Set(targets.map((target) => target.url))];
const checks = new Map<string, Awaited<ReturnType<typeof probe>>>();
let cursor = 0;

await Promise.all(Array.from({ length: Math.min(concurrency, uniqueUrls.length) }, async () => {
  while (cursor < uniqueUrls.length) {
    const url = uniqueUrls[cursor++];
    const result = await probe(url);
    checks.set(url, result);
    const marker = result.isPdf ? 'PDF' : result.ok ? 'PAGE' : 'FAIL';
    console.log(`[${marker}] ${result.status ?? '-'} ${url}`);
  }
}));

const checkedAt = new Date().toISOString();
const results: CheckResult[] = targets.map((target) => ({
  ...target,
  checkedAt,
  ...checks.get(target.url)!,
}));
const primary = results.filter((result) => result.linkKind === 'primary');
const summary = {
  documentCount: primary.length,
  buttonLinkCount: results.length,
  uniqueUrlCount: uniqueUrls.length,
  workingButtonLinks: results.filter((result) => result.ok).length,
  failedButtonLinks: results.filter((result) => !result.ok).length,
  downloadablePrimaryPdfs: primary.filter((result) => result.isPdf).length,
  workingNonPdfPrimaryLinks: primary.filter((result) => result.ok && !result.isPdf).length,
  failedPrimaryLinks: primary.filter((result) => !result.ok).length,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ schemaVersion: 1, checkedAt, summary, results }, null, 2)}\n`, 'utf8');
console.log(`\nReport: ${outputPath}`);
console.log(JSON.stringify(summary, null, 2));

if (strict && summary.failedButtonLinks > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
