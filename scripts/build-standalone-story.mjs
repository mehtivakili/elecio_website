import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const webStoryPath = path.join(projectRoot, 'public', '3d', 'story', 'index.html');
const standalonePath = path.join(projectRoot, '3dObject', 'elecio-story.html');

const fontFiles = [
  'vazirmatn-400.woff2',
  'vazirmatn-500.woff2',
  'vazirmatn-700.woff2',
  'vazirmatn-900.woff2',
];

function safeInlineScript(source) {
  return source.replace(/<\/script/gi, '<\\/script');
}

let html = await readFile(webStoryPath, 'utf8');
const threeSource = await readFile(path.join(projectRoot, 'public', '3d', 'story', 'three.min.js'), 'utf8');
const deviceSource = await readFile(path.join(projectRoot, 'public', '3d', 'story', 'elecio-device.js'), 'utf8');

// Data-URI fonts make Persian typography work even when the HTML is opened directly from disk.
for (const fontFile of fontFiles) {
  const font = await readFile(path.join(projectRoot, 'public', 'fonts', fontFile));
  const dataUri = `data:font/woff2;base64,${font.toString('base64')}`;
  html = html.replaceAll(`/fonts/${fontFile}`, dataUri);
}

// Preloading a data URI duplicates work and provides no network advantage in the single-file build.
html = html.replace(/<link rel="preload" href="data:font\/woff2;base64,[^"]+" as="font" type="font\/woff2" crossorigin>\r?\n/g, '');

html = html.replace(
  '<script src="./three.min.js"></script>',
  `<script>\n${safeInlineScript(threeSource)}\n</script>`,
);
html = html.replace(
  '<script src="./elecio-device.js"></script>',
  `<script>\n${safeInlineScript(deviceSource)}\n</script>`,
);

// Keep the web query-string behavior, with a useful fallback when the file is double-clicked.
html = html.replace(
  "const FA=new URLSearchParams(location.search).get('lang')==='fa';",
  "const requestedLang=new URLSearchParams(location.search).get('lang');\nconst FA=requestedLang?requestedLang==='fa':navigator.language.toLowerCase().startsWith('fa');",
);

html = html.replace(
  '<!doctype html>',
  '<!doctype html>\n<!-- Generated from public/3d/story/index.html by scripts/build-standalone-story.mjs. -->',
);

if (html.includes('<script src=') || html.includes("url('/fonts/")) {
  throw new Error('Standalone story still contains a local script or font dependency.');
}

await writeFile(standalonePath, html, 'utf8');
const bytes = Buffer.byteLength(html);
console.log(`Updated ${path.relative(projectRoot, standalonePath)} (${bytes.toLocaleString('en-US')} bytes)`);
