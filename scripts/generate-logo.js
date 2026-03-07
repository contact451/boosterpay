import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, '../public/boosterpay-logo-light.svg');
const outputPath = resolve(__dirname, '../public/boosterpay-logo-light.png');

const svg = readFileSync(svgPath, 'utf-8');

// Scale SVG to 600x120 with white background
const scaledSvg = svg
  .replace('viewBox="0 0 200 40"', 'viewBox="0 0 200 40"')
  .replace('width="200"', 'width="600"')
  .replace('height="40"', 'height="120"');

await sharp(Buffer.from(scaledSvg))
  .flatten({ background: '#FFFFFF' })
  .png()
  .toFile(outputPath);

console.log(`PNG generated: ${outputPath}`);
