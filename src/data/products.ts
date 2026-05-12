export type Category = 'Outerwear' | 'Tailoring' | 'Ready-to-wear' | 'Knitwear' | 'Tops' | 'Footwear' | 'Accessories';

export type Product = {
  slug:     string;
  num:      string;
  name:     string;
  price:    number;
  category: Category;
  material: string;
  origin:   string;
  desc:     string;
  sizes:    string[];
  img:      string;
  img2?:    string;
};

export const PRODUCTS: Product[] = [
  {
    slug:     'obsidian-coat',
    num:      '001',
    name:     'Obsidian Coat',
    price:    3200,
    category: 'Outerwear',
    material: 'Virgin wool, silk lining',
    origin:   'Milan, Italy',
    desc:     'Cut from a single weight of virgin wool. Deep, structured, uncompromising. The coat that closes a room.',
    sizes:    ['XS', 'S', 'M', 'L', 'XL'],
    img:      'coat-primary',
    img2:     'coat-secondary',
  },
  {
    slug:     'void-jacket',
    num:      '002',
    name:     'Void Jacket',
    price:    2100,
    category: 'Outerwear',
    material: 'Technical gabardine',
    origin:   'Antwerp, Belgium',
    desc:     'Sits on the body like a second skin. Every seam is a decision.',
    sizes:    ['XS', 'S', 'M', 'L'],
    img:      'jacket-primary',
    img2:     'jacket-secondary',
  },
  {
    slug:     'ash-trousers',
    num:      '003',
    name:     'Ash Trousers',
    price:    1400,
    category: 'Tailoring',
    material: 'Japanese cotton twill',
    origin:   'Tokyo, Japan',
    desc:     'High-rise, wide-leg. The colour of aftermath. Cut with the discipline of tailoring and the ease of a garment worn for decades.',
    sizes:    ['XS', 'S', 'M', 'L', 'XL'],
    img:      'trousers-primary',
    img2:     'trousers-secondary',
  },
  {
    slug:     'shadow-dress',
    num:      '004',
    name:     'Shadow Dress',
    price:    2800,
    category: 'Ready-to-wear',
    material: 'Matte crepe, bias cut',
    origin:   'Paris, France',
    desc:     'It moves the way shadows move. Bias cut from matte crepe — falling along the body with absolute intention.',
    sizes:    ['XS', 'S', 'M', 'L'],
    img:      'dress-primary',
    img2:     'dress-secondary',
  },
  {
    slug:     'bone-shirt',
    num:      '005',
    name:     'Bone Shirt',
    price:    680,
    category: 'Tops',
    material: 'Egyptian cotton poplin',
    origin:   'Cairo, Egypt',
    desc:     'Off-white. Not white. There is a difference. Oversized collar, dropped shoulders, silence in every thread.',
    sizes:    ['S', 'M', 'L', 'XL'],
    img:      'shirt-primary',
    img2:     'shirt-secondary',
  },
  {
    slug:     'eclipse-boots',
    num:      '006',
    name:     'Eclipse Boots',
    price:    1900,
    category: 'Footwear',
    material: 'Full-grain calf leather',
    origin:   'Florence, Italy',
    desc:     'Hand-stitched in Florence. A silhouette that extends the leg, closes the foot like a door. Not footwear. Punctuation.',
    sizes:    ['39', '40', '41', '42', '43', '44'],
    img:      'boots-primary',
    img2:     'boots-secondary',
  },
  {
    slug:     'void-belt',
    num:      '007',
    name:     'Void Belt',
    price:    420,
    category: 'Accessories',
    material: 'Vegetable-tanned leather',
    origin:   'Florence, Italy',
    desc:     'One strip. Matte hardware. Finishes an outfit the way a full stop finishes a sentence.',
    sizes:    ['70', '75', '80', '85', '90'],
    img:      'belt-primary',
    img2:     'belt-secondary',
  },
  {
    slug:     'cashmere-knit',
    num:      '008',
    name:     'Cashmere Knit',
    price:    1200,
    category: 'Knitwear',
    material: 'Grade A cashmere, 12-gauge',
    origin:   'Edinburgh, Scotland',
    desc:     'Spun from Grade A Mongolian cashmere at 12-gauge. Worn alone or layered — it disappears into the body without disappearing from notice.',
    sizes:    ['XS', 'S', 'M', 'L', 'XL'],
    img:      'knit-primary',
    img2:     'knit-secondary',
  },
  {
    slug:     'wool-trousers',
    num:      '009',
    name:     'Wool Trousers',
    price:    1650,
    category: 'Tailoring',
    material: 'Merino wool, unlined',
    origin:   'Milan, Italy',
    desc:     'Straight leg, mid-rise. The wool is from a single flock in Biella. Unlined, it breathes. Pleated front — a nod to the archive.',
    sizes:    ['XS', 'S', 'M', 'L', 'XL'],
    img:      'wool-trousers-primary',
    img2:     'wool-trousers-secondary',
  },
  {
    slug:     'void-tote',
    num:      '010',
    name:     'Void Tote',
    price:    890,
    category: 'Accessories',
    material: 'Waxed cotton canvas, bridle leather',
    origin:   'Florence, Italy',
    desc:     "Carries everything you need. Nothing it doesn't. Waxed cotton canvas ages into itself — darker at the corners, more itself every day.",
    sizes:    ['One Size'],
    img:      'tote-primary',
    img2:     'tote-secondary',
  },
  {
    slug:     'dark-layer-coat',
    num:      '011',
    name:     'Dark Layer Coat',
    price:    4100,
    category: 'Outerwear',
    material: 'Boiled wool, cashmere lining',
    origin:   'Edinburgh, Scotland',
    desc:     'The heaviest thing in the room. Boiled wool from Scotland — cashmere lined. Layers over everything and still demands the final word.',
    sizes:    ['XS', 'S', 'M', 'L', 'XL'],
    img:      'dark-coat-primary',
    // img2 omitted — no secondary shot exists for this piece
  },
  {
    slug:     'silk-slip',
    num:      '012',
    name:     'Silk Slip',
    price:    1100,
    category: 'Ready-to-wear',
    material: '100% silk charmeuse',
    origin:   'Lyon, France',
    desc:     'Woven in Lyon from 100% silk charmeuse. Bias cut, midi length. The weight of it is the point — you feel it moving before anyone sees it.',
    sizes:    ['XS', 'S', 'M', 'L'],
    img:      'slip-primary',
    img2:     'slip-secondary',
  },
];

/** Format a numeric price for display (e.g. 3200 → "3,200") */
export function formatProductPrice(price: number): string {
  return price.toLocaleString('en-US');
}

export const SHARED_DETAILS: [string, string][] = [
  ['Construction', 'Hand-finished seams'],
  ['Care',         'Dry clean only'],
  ['Delivery',     '5–10 business days'],
];

export const CATEGORIES = [
  'All',
  'Outerwear',
  'Tailoring',
  'Ready-to-wear',
  'Knitwear',
  'Tops',
  'Footwear',
  'Accessories',
] as const;
