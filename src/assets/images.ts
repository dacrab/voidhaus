/// <reference types="astro/client" />

const raw = import.meta.glob<{ default: ImageMetadata }>(
  './img/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

export const IMAGES: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(raw).map(([path, mod]) => [
    path.replace('./img/', '').replace(/\.[^.]+$/, ''),
    mod.default,
  ]),
);

export function getImage(key: string): ImageMetadata {
  const img = IMAGES[key];
  if (!img) throw new Error(`[images] not found: "${key}". Available: ${Object.keys(IMAGES).join(', ')}`);
  return img;
}
