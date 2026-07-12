import type { Product } from "./products";

export function filterProducts(products: Product[], search: string, category: string): Product[] {
  const q = search.trim().toLowerCase();
  return products.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.origin.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    );
  });
}
