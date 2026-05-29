export function applyServiceFee(
  subtotalCents: number,
  percent: number,
): number {
  return Math.round(subtotalCents * (1 + percent / 100));
}
