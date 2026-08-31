import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceDirectory = path.resolve(process.cwd(), 'media', 'carousel');
const outputDirectory = path.resolve(process.cwd(), 'public', 'images', 'instagram', 'carousels');
const files = (await readdir(sourceDirectory))
  .filter((file) => file.toLowerCase().endsWith('.png'))
  .sort((first, second) => {
    const firstNumber = Number.parseInt(path.parse(first).name, 10);
    const secondNumber = Number.parseInt(path.parse(second).name, 10);
    if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) return firstNumber - secondNumber;
    return first.localeCompare(second, 'en', { numeric: true });
  });

await mkdir(outputDirectory, { recursive: true });

for (const [postIndex, file] of files.entries()) {
  const source = sharp(path.join(sourceDirectory, file), { failOn: 'warning' });
  const metadata = await source.metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Could not read dimensions for ${file}`);

  const postDirectory = path.join(outputDirectory, `post-${String(postIndex + 1).padStart(2, '0')}`);
  await mkdir(postDirectory, { recursive: true });

  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const left = Math.round((column * metadata.width) / 3);
      const right = Math.round(((column + 1) * metadata.width) / 3);
      const top = Math.round((row * metadata.height) / 2);
      const bottom = Math.round(((row + 1) * metadata.height) / 2);
      const slide = row * 3 + column + 1;
      await sharp(path.join(sourceDirectory, file), { failOn: 'warning' })
        .extract({ left, top, width: right - left, height: bottom - top })
        .webp({ quality: 88, effort: 5 })
        .toFile(path.join(postDirectory, `slide-${String(slide).padStart(2, '0')}.webp`));
    }
  }
  process.stdout.write(`Imported ${file} as post-${String(postIndex + 1).padStart(2, '0')}\n`);
}

process.stdout.write(`Created ${files.length * 6} Instagram preview slides from ${files.length} carousel sheets.\n`);
