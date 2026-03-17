export type Product = {
  slug: string;
  num: string;
  name: string;
  price: string;
  category: 'Outerwear' | 'Tailoring' | 'Ready-to-wear' | 'Tops' | 'Footwear' | 'Accessories';
  material: string;
  origin: string;
  desc: string;
  sizes: string[];
  img: string;
  img2: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: 'obsidian-coat',
    num: '001',
    name: 'Obsidian Coat',
    price: '3,200',
    category: 'Outerwear',
    material: 'Virgin wool',
    origin: 'Milan, Italy',
    desc: 'Cut from a single weight of virgin wool. Deep, structured, uncompromising. The coat that closes a room.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=85&auto=format&fit=crop&crop=top',
    img2: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=900&q=80&auto=format&fit=crop&crop=top',
  },
  {
    slug: 'void-jacket',
    num: '002',
    name: 'Void Jacket',
    price: '2,100',
    category: 'Outerwear',
    material: 'Technical gabardine',
    origin: 'Antwerp, Belgium',
    desc: 'Sits on the body like a second skin. Every seam is a decision.',
    sizes: ['XS', 'S', 'M', 'L'],
    img: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=85&auto=format&fit=crop&crop=top',
    img2: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80&auto=format&fit=crop&crop=top',
  },
  {
    slug: 'ash-trousers',
    num: '003',
    name: 'Ash Trousers',
    price: '1,400',
    category: 'Tailoring',
    material: 'Japanese cotton twill',
    origin: 'Tokyo, Japan',
    desc: 'High-rise, wide-leg. The colour of aftermath.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=85&auto=format&fit=crop&crop=top',
    img2: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80&auto=format&fit=crop&crop=top',
  },
  {
    slug: 'shadow-dress',
    num: '004',
    name: 'Shadow Dress',
    price: '2,800',
    category: 'Ready-to-wear',
    material: 'Matte crepe, bias cut',
    origin: 'Paris, France',
    desc: 'It moves the way shadows move. Bias cut, matte crepe, absolute intention.',
    sizes: ['XS', 'S', 'M', 'L'],
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=85&auto=format&fit=crop&crop=top',
    img2: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80&auto=format&fit=crop&crop=top',
  },
  {
    slug: 'bone-shirt',
    num: '005',
    name: 'Bone Shirt',
    price: '680',
    category: 'Tops',
    material: 'Egyptian cotton poplin',
    origin: 'Cairo, Egypt',
    desc: 'Off-white. Not white. There is a difference.',
    sizes: ['S', 'M', 'L', 'XL'],
    img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&q=85&auto=format&fit=crop&crop=top',
    img2: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&auto=format&fit=crop',
  },
  {
    slug: 'eclipse-boots',
    num: '006',
    name: 'Eclipse Boots',
    price: '1,900',
    category: 'Footwear',
    material: 'Full-grain calf leather',
    origin: 'Florence, Italy',
    desc: 'Hand-stitched in Florence. Not footwear. Punctuation.',
    sizes: ['39', '40', '41', '42', '43', '44'],
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=85&auto=format&fit=crop',
    img2: 'https://images.unsplash.com/photo-1624623278313-a930126a11c3?w=900&q=80&auto=format&fit=crop',
  },
  {
    slug: 'void-belt',
    num: '007',
    name: 'Void Belt',
    price: '420',
    category: 'Accessories',
    material: 'Vegetable-tanned leather',
    origin: 'Florence, Italy',
    desc: 'One strip. Matte hardware. Finishes an outfit the way a full stop finishes a sentence.',
    sizes: ['70', '75', '80', '85', '90'],
    img: 'https://images.unsplash.com/photo-1624623278313-a930126a11c3?w=1200&q=85&auto=format&fit=crop',
    img2: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&auto=format&fit=crop',
  },
  {
    slug: 'dark-layer-coat',
    num: '008',
    name: 'Dark Layer Coat',
    price: '4,100',
    category: 'Outerwear',
    material: 'Boiled wool, cashmere lining',
    origin: 'Edinburgh, Scotland',
    desc: 'The heaviest thing in the room. Demands the final word.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    img: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1200&q=85&auto=format&fit=crop&crop=top',
    img2: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80&auto=format&fit=crop&crop=top',
  },
];

export const SHARED_DETAILS = [
  ['Construction', 'Hand-finished seams'],
  ['Care',         'Dry clean only'],
  ['Delivery',     '5–10 business days'],
] as const;

export const CATEGORIES = ['All', 'Outerwear', 'Tailoring', 'Ready-to-wear', 'Tops', 'Footwear', 'Accessories'] as const;
