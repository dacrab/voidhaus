export interface PricedLine {
  readonly price: number;
  readonly quantity: number;
}

export interface DiscountResult<T> {
  readonly items: T[];
  readonly total: number;
  readonly discount: number;
}

function subtotal(lines: readonly PricedLine[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

/**
 * Split `target` cents across lines proportionally to their gross amount,
 * using the largest-remainder method. Every line keeps at least one cent.
 */
function allocateShares(lines: readonly PricedLine[], target: number): number[] {
  const shares = lines.map(() => 0);
  if (target <= 0) return shares;

  const gross = lines.map((line) => line.price * line.quantity);
  const total = gross.reduce((sum, amount) => sum + amount, 0);
  if (total <= 0) return shares;

  const remainders: Array<{ index: number; remainder: number }> = [];
  let allocated = 0;

  gross.forEach((amount, index) => {
    const exact = (target * amount) / total;
    const base = Math.min(Math.floor(exact), Math.max(0, amount - 1));
    shares[index] = base;
    allocated += base;
    remainders.push({ index, remainder: exact - Math.floor(exact) });
  });

  remainders.sort((a, b) => b.remainder - a.remainder);

  let left = target - allocated;
  while (left > 0) {
    let progressed = false;
    for (const { index } of remainders) {
      if (left === 0) break;
      const cap = Math.max(0, (gross[index] ?? 0) - 1);
      const current = shares[index] ?? 0;
      if (current < cap) {
        shares[index] = current + 1;
        left -= 1;
        progressed = true;
      }
    }
    if (!progressed) break;
  }

  return shares;
}

export function applyDiscount<T extends PricedLine>(
  lines: readonly T[],
  percentOff: number | null,
  fixedOff: number | null,
): DiscountResult<T> {
  const before = subtotal(lines);
  const target = percentOff !== null ? Math.round((before * percentOff) / 100) : Math.min(fixedOff ?? 0, before);

  if (target <= 0) return { items: [...lines], total: before, discount: 0 };

  const shares = allocateShares(lines, target);
  const items = lines.map((line, index) => ({
    ...line,
    price: Math.max(1, Math.floor((line.price * line.quantity - (shares[index] ?? 0)) / line.quantity)),
  })) as T[];

  const total = subtotal(items);
  return { items, total, discount: before - total };
}
