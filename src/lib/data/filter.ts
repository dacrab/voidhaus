import type { Category, Product } from "./products";

export type CategoryFilter = Category | "All";

export function filterProducts(
  products: readonly Product[],
  search: string,
  category: CategoryFilter,
): readonly Product[] {
  const query = search.trim().toLowerCase();
  return products.filter((product) => {
    if (category !== "All" && product.category !== category) return false;
    if (!query) return true;
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.material.toLowerCase().includes(query) ||
      product.origin.toLowerCase().includes(query) ||
      product.desc.toLowerCase().includes(query)
    );
  });
}
