import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('icons', { recursive: true });

const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 220, g: 20, b: 20, alpha: 1 },
    },
  })
    .png()
    .toFile(`icons/icon${size}.png`);
  console.log(`Created icons/icon${size}.png`);
}

console.log('Done');
