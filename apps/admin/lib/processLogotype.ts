import 'server-only';
import sharp from 'sharp';

// Same pipeline as moje-aplikace/scripts/process-logotypes.mjs — kept in
// sync deliberately so a logotype uploaded here and one pushed via the CLI
// script get identical treatment. See that file for the full rationale.

const BG_TOLERANCE = 24;
const SATURATION_THRESHOLD = 30;
const COLORED_PIXEL_FRACTION_THRESHOLD = 0.1;
const INK_COLOR = { r: 0, g: 0, b: 0 };
const MAX_HEIGHT = 300;

interface RGB {
  r: number;
  g: number;
  b: number;
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const lightness = (max + min) / 2;
  return ((max - min) / (255 - Math.abs(2 * lightness - 255))) * 255;
}

export interface ProcessedLogotype {
  buffer: Buffer;
  recolored: boolean;
  strippedBg: boolean;
  uncertainBg: boolean;
}

export async function processLogotype(input: Buffer): Promise<ProcessedLogotype> {
  const { data, info } = await sharp(input, { density: 300 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const pixels = Buffer.from(data);

  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ].map(([x, y]) => {
    const idx = (y * width + x) * channels;
    return { r: pixels[idx], g: pixels[idx + 1], b: pixels[idx + 2], a: pixels[idx + 3] };
  });

  let hasRealTransparency = false;
  for (let i = 3; i < pixels.length; i += channels) {
    if (pixels[i] < 250) {
      hasRealTransparency = true;
      break;
    }
  }

  let strippedBg = false;
  if (!hasRealTransparency) {
    const allCornersMatch = corners.every((c) => colorDistance(c, corners[0]) < BG_TOLERANCE);
    if (allCornersMatch) {
      const bg = corners[0];
      for (let i = 0; i < pixels.length; i += channels) {
        if (colorDistance({ r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] }, bg) < BG_TOLERANCE) {
          pixels[i + 3] = 0;
        }
      }
      strippedBg = true;
    }
  }

  let sampleCount = 0;
  let coloredCount = 0;
  for (let i = 0; i < pixels.length; i += channels) {
    if (pixels[i + 3] <= 40) continue;
    sampleCount += 1;
    if (saturation(pixels[i], pixels[i + 1], pixels[i + 2]) > SATURATION_THRESHOLD) {
      coloredCount += 1;
    }
  }

  let recolored = false;
  const uncertainBg = !hasRealTransparency && !strippedBg;

  if (sampleCount > 0 && coloredCount / sampleCount < COLORED_PIXEL_FRACTION_THRESHOLD) {
    for (let i = 0; i < pixels.length; i += channels) {
      if (pixels[i + 3] > 0) {
        pixels[i] = INK_COLOR.r;
        pixels[i + 1] = INK_COLOR.g;
        pixels[i + 2] = INK_COLOR.b;
      }
    }
    recolored = true;
  }

  const buffer = await sharp(pixels, { raw: { width, height, channels } })
    .trim()
    .resize({ height: MAX_HEIGHT, withoutEnlargement: true })
    .png()
    .toBuffer();

  return { buffer, recolored, strippedBg, uncertainBg };
}
