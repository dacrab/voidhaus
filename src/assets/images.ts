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
