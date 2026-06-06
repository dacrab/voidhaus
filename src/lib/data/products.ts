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

export interface Product {
  slug: string;
  num: string;
  name: string;
  price: number;
  category: string;
  material: string;
  origin: string;
  desc: string;
  sizes: string[];
  img: string;
  img2: string;
}

export const PRODUCTS: Product[] = [
  { slug: 'ash-trousers', num: '003', name: 'Ash Trousers', price: 1400, category: 'Tailoring', material: 'Wool-blend gabardine', origin: 'Antwerp, Belgium', desc: 'Wide-leg trousers in a medium-weight wool blend. Pressed crease, slash pockets, extended tab waist. Cut to fall from the hip without grabbing.', sizes: ['XS', 'S', 'M', 'L', 'XL'], img: 'trousers-primary', img2: 'trousers-secondary' },
  { slug: 'bone-shirt', num: '005', name: 'Bone Shirt', price: 680, category: 'Tops', material: 'Organic cotton poplin', origin: 'Milan, Italy', desc: 'Oversized poplin shirt with a soft collar and concealed placket. Single cuffs, back box pleat. Meant to be worn untucked, slightly rumpled.', sizes: ['XS', 'S', 'M', 'L'], img: 'shirt-primary', img2: 'shirt-secondary' },
  { slug: 'cashmere-knit', num: '008', name: 'Cashmere Knit', price: 1200, category: 'Knitwear', material: 'Grade-A Mongolian cashmere', origin: 'Florence, Italy', desc: 'Relaxed crewneck in 12-gauge cashmere. Ribbed cuffs and hem. One of those pieces you reach for without thinking — which is the point.', sizes: ['S', 'M', 'L', 'XL'], img: 'knit-primary', img2: 'knit-secondary' },
  { slug: 'dark-layer-coat', num: '011', name: 'Dark Layer Coat', price: 4100, category: 'Outerwear', material: 'Double-faced cashmere-wool', origin: 'Milan, Italy', desc: 'Floor-length overcoat in double-faced cashmere. No lining — the fabric is the construction. Minimal lapels, patch pockets, concealed button.', sizes: ['S', 'M', 'L'], img: 'dark-coat-primary', img2: '' },
  { slug: 'eclipse-boots', num: '012', name: 'Eclipse Boots', price: 1800, category: 'Footwear', material: 'Vegetable-tanned calfskin', origin: 'Florence, Italy', desc: 'Knee-high pulling boot in matte calfskin. Leather sole, stacked heel, elastic side panels. The leather will mark — that is the finish.', sizes: ['38', '39', '40', '41', '42', '43'], img: 'boots-primary', img2: 'boots-secondary' },
  { slug: 'obsidian-coat', num: '001', name: 'Obsidian Coat', price: 3800, category: 'Outerwear', material: 'Double-faced cashmere-wool', origin: 'Milan, Italy', desc: 'Belted overcoat in charcoal double-cloth. American shoulders, deep patch pockets, self-belt at the waist. A coat you never take off indoors.', sizes: ['S', 'M', 'L', 'XL'], img: 'coat-primary', img2: 'coat-secondary' },
  { slug: 'shadow-dress', num: '006', name: 'Shadow Dress', price: 1600, category: 'Ready-to-wear', material: 'Crepe-back satin', origin: 'Antwerp, Belgium', desc: 'Floor-length column dress in heavy satin. Cowl neckline, open back, bias-cut skirt. No zippers — it slips over the head and stays.', sizes: ['XS', 'S', 'M', 'L'], img: 'dress-primary', img2: 'dress-secondary' },
  { slug: 'silk-slip', num: '009', name: 'Silk Slip', price: 900, category: 'Ready-to-wear', material: 'Mulberry silk charmeuse', origin: 'Milan, Italy', desc: 'Midi-length slip dress in washed silk. Fine straps, cowl neckline, bias cut. Meant to show skin and shadow in equal measure.', sizes: ['XS', 'S', 'M', 'L'], img: 'slip-primary', img2: 'slip-secondary' },
  { slug: 'void-belt', num: '004', name: 'Void Belt', price: 480, category: 'Accessories', material: 'Hand-burnished calfskin', origin: 'Florence, Italy', desc: 'Wide belt in matte calfskin with a solid brass buckle. Unlined, hand-stitched edges. It marks quickly and improves with wear.', sizes: ['80', '85', '90', '95'], img: 'belt-primary', img2: 'belt-secondary' },
  { slug: 'void-jacket', num: '002', name: 'Void Jacket', price: 2600, category: 'Outerwear', material: 'Brushed cotton-cashmere', origin: 'Antwerp, Belgium', desc: 'Cropped jacket in a brushed cotton-cashmere blend. Stand collar, two-way zip, raw-edge hem. Hard to explain, easy to wear.', sizes: ['S', 'M', 'L', 'XL'], img: 'jacket-primary', img2: 'jacket-secondary' },
  { slug: 'void-tote', num: '010', name: 'Void Tote', price: 780, category: 'Accessories', material: 'Vacchetta leather', origin: 'Florence, Italy', desc: 'Unlined tote in vegetable-tanned vacchetta. Single open compartment, internal snap closure, hand-stitched handles. It darkens with use.', sizes: ['One size'], img: 'tote-primary', img2: 'tote-secondary' },
  { slug: 'wool-trousers', num: '007', name: 'Wool Trousers', price: 1100, category: 'Tailoring', material: 'Merino wool-flannel', origin: 'Antwerp, Belgium', desc: 'Flat-front trousers in merino flannel. Side adjusters, slash pockets, plain hem. The kind of trouser that makes everything else look intentional.', sizes: ['XS', 'S', 'M', 'L', 'XL'], img: 'wool-trousers-primary', img2: 'wool-trousers-secondary' },
];