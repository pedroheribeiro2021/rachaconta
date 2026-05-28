export function splitCentsEvenly(
  totalCents: number,
  peopleCount: number,
): number[] {
  if (peopleCount <= 0) {
    throw new Error("peopleCount must be greater than zero");
  }

  const base = Math.floor(totalCents / peopleCount);

  const remainder = totalCents % peopleCount;

  return Array.from({ length: peopleCount }, (_, index) =>
    index < remainder ? base + 1 : base,
  );
}
