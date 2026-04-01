import type { Category } from './products';

export type Spread = {
  issue:      string;
  title:      string;
  subtitle:   string;
  imgKey:     string;
  heroSlug:   string;
  categories: Category[];
};

export const SPREADS: Spread[] = [
  {
    issue:      '01',
    title:      'Weight',
    subtitle:   'On the architecture of outerwear',
    imgKey:     'coat-primary',
    heroSlug:   'obsidian-coat',
    categories: ['Outerwear'],
  },
  {
    issue:      '02',
    title:      'Structure',
    subtitle:   'Tailoring, knitwear, the dressed body',
    imgKey:     'trousers-primary',
    heroSlug:   'ash-trousers',
    categories: ['Tailoring', 'Ready-to-wear', 'Knitwear', 'Tops'],
  },
  {
    issue:      '03',
    title:      'Surface',
    subtitle:   'Leather, canvas, the carried object',
    imgKey:     'boots-primary',
    heroSlug:   'eclipse-boots',
    categories: ['Footwear', 'Accessories'],
  },
];
