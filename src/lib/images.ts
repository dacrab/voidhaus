const PRODUCT_IMAGE_WIDTHS = [480, 800, 1200] as const;
const WIDE_IMAGE_WIDTHS = [960, 1440, 1920] as const;

export interface ImageSource {
  readonly src: string;
  readonly srcset: string;
}

function imageSource(src: string, widths: readonly number[]): ImageSource {
  const base = src.replace(/\.jpe?g$/, "");
  const largest = Math.max(...widths);
  return {
    src: `${base}-${largest}.webp`,
    srcset: widths.map((width) => `${base}-${width}.webp ${width}w`).join(", "),
  };
}

/** Responsive variants for catalog and portrait editorial images. */
export function productImage(src: string): ImageSource {
  return imageSource(src, PRODUCT_IMAGE_WIDTHS);
}

/** Responsive variants for full-bleed landscape images. */
export function wideImage(src: string): ImageSource {
  return imageSource(src, WIDE_IMAGE_WIDTHS);
}
