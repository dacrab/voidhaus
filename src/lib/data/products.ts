export const CATEGORIES = ["Outerwear", "Body", "Tops", "Ready-to-wear", "Accessories", "Objects"] as const;

export type Category = (typeof CATEGORIES)[number];

export const SITE_IMAGES = {
  hero: "/img/hero.jpg",
  editorial: "/img/editorial.jpg",
  atelier: "/img/atelier.jpg",
} as const;

export const PRODUCT_DETAILS: readonly [string, string][] = [
  ["Construction", "Hand-finished seams"],
  ["Care", "Dry clean only"],
  ["Delivery", "5–10 working days"],
];

export interface Product {
  readonly slug: string;
  readonly num: string;
  readonly name: string;
  readonly price: number;
  readonly category: Category;
  readonly material: string;
  readonly origin: string;
  readonly desc: string;
  readonly sizes: readonly string[];
  readonly img: string;
  readonly img2?: string;
  /** Overrides the default apparel spec table for objects. */
  readonly details?: readonly (readonly [string, string])[];
}

// The catalog is static so the storefront and product pages can be fully
// prerendered. Convex only stores per-size stock, keyed by `slug`.
export const PRODUCTS = [
  {
    slug: "obsidian-coat",
    num: "001",
    name: "Obsidian Coat",
    price: 3800,
    category: "Outerwear",
    material: "Double-faced cashmere",
    origin: "Milan, Italy",
    desc: "A floor-length coat in double-faced cashmere. No lining. The fabric is the construction. Belt it, or carry it open.",
    sizes: ["S", "M", "L", "XL"],
    img: "/img/1-primary.jpg",
    img2: "/img/1-secondary.jpg",
  },
  {
    slug: "void-jacket",
    num: "002",
    name: "Void Jacket",
    price: 2600,
    category: "Outerwear",
    material: "Washed cupro satin",
    origin: "Antwerp, Belgium",
    desc: "A wrap jacket in washed cupro. No closure, no shoulder pad, no apology. It stays on because you keep it there.",
    sizes: ["S", "M", "L"],
    img: "/img/3-primary.jpg",
  },
  {
    slug: "second-skin",
    num: "003",
    name: "Second Skin",
    price: 920,
    category: "Body",
    material: "Recycled nylon mesh",
    origin: "Antwerp, Belgium",
    desc: "Two pieces in sheer nylon mesh. High neck, low back. A layer, or the only layer.",
    sizes: ["XS", "S", "M", "L"],
    img: "/img/2-primary.jpg",
    img2: "/img/2-secondary.jpg",
  },
  {
    slug: "net-body",
    num: "004",
    name: "Net Body",
    price: 780,
    category: "Body",
    material: "Hand-knotted viscose net",
    origin: "Florence, Italy",
    desc: "A bodysuit in hand-knotted net. Cut away at the ribs and the hip. Nothing underneath.",
    sizes: ["XS", "S", "M", "L"],
    img: "/img/4-primary.jpg",
  },
  {
    slug: "null-tee",
    num: "005",
    name: "Null Tee",
    price: 220,
    category: "Tops",
    material: "Japanese cotton jersey",
    origin: "Tokyo, Japan",
    desc: "A boxy crewneck in heavy Japanese jersey. Blind-hemmed, unlabelled. It will fade. That is the point.",
    sizes: ["XS", "S", "M", "L", "XL"],
    img: "/img/6-primary.jpg",
  },
  {
    slug: "veil-hood",
    num: "006",
    name: "Veil Hood",
    price: 340,
    category: "Accessories",
    material: "Silk tulle, brass",
    origin: "Florence, Italy",
    desc: "A hood in silk tulle with a brass throat clasp. It obscures. It does not conceal.",
    sizes: ["One size"],
    img: "/img/7-primary.jpg",
  },
  {
    slug: "mirage-dress",
    num: "007",
    name: "Mirage Dress",
    price: 1650,
    category: "Ready-to-wear",
    material: "Embroidered cotton voile",
    origin: "Milan, Italy",
    desc: "A long dress in embroidered cotton voile. Deep sleeves, hand-finished hem. The colour is the only ornament.",
    sizes: ["XS", "S", "M", "L"],
    img: "/img/8-primary.jpg",
  },
  {
    slug: "skin-suit",
    num: "008",
    name: "Skin Suit",
    price: 1900,
    category: "Body",
    material: "Stretch lambskin",
    origin: "Florence, Italy",
    desc: "A catsuit in stretch lambskin. Zip at the back. Detached sleeves. A second body, worn over the first.",
    sizes: ["XS", "S", "M", "L"],
    img: "/img/9-primary.jpg",
  },
  {
    slug: "foundation-set",
    num: "009",
    name: "Foundation Set",
    price: 680,
    category: "Ready-to-wear",
    material: "Dense cotton rib",
    origin: "Antwerp, Belgium",
    desc: "A crop top and legging in dense cotton rib. Cut high, worn low. The foundation of the index.",
    sizes: ["XS", "S", "M", "L"],
    img: "/img/12-primary.jpg",
  },
  {
    slug: "fallen-harness",
    num: "010",
    name: "Fallen Harness",
    price: 1450,
    category: "Accessories",
    material: "Calfskin, goose feather",
    origin: "Florence, Italy",
    desc: "A calfskin harness with feathered wings. Buckle at the sternum. For evenings that require a second silhouette.",
    sizes: ["S", "M", "L"],
    img: "/img/11-primary.jpg",
  },
  {
    slug: "readymade-chair",
    num: "011",
    name: "Readymade Chair",
    price: 480,
    category: "Objects",
    material: "Moulded polypropylene",
    origin: "Lake Maggiore, Italy",
    desc: "A found stackable chair in moulded polypropylene. Edition of twelve. For the room, not the body.",
    sizes: ["One size"],
    img: "/img/5-primary.jpg",
    details: [
      ["Edition", "Twelve"],
      ["Care", "Wipe with a damp cloth"],
      ["Delivery", "5–10 working days"],
    ],
  },
  {
    slug: "void-parfum",
    num: "012",
    name: "Void Parfum",
    price: 240,
    category: "Objects",
    material: "Eau de parfum, 50 ml",
    origin: "Milan, Italy",
    desc: "Black iris, wet stone, skin. 50 ml. Wear it where the pulse is.",
    sizes: ["50 ml"],
    img: "/img/10-primary.jpg",
    details: [
      ["Volume", "50 ml"],
      ["Care", "Store away from light"],
      ["Delivery", "5–10 working days"],
    ],
  },
] as const satisfies readonly Product[];

export const APPAREL_CATEGORIES: readonly Category[] = ["Outerwear", "Body", "Tops", "Ready-to-wear", "Accessories"];

const PRODUCTS_BY_SLUG = new Map<string, Product>(PRODUCTS.map((product) => [product.slug, product]));

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS_BY_SLUG.get(slug);
}

export function requireProduct(slug: string): Product {
  const product = getProduct(slug);
  if (!product) throw new Error(`Unknown product: ${slug}`);
  return product;
}
