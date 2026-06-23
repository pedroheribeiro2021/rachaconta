"use client";

interface Props {
  name: string;

  priceLabel: string;

  selected: boolean;

  onToggle: () => void;
}

export function ItemCard({
  name,

  priceLabel,

  selected,

  onToggle,
}: Props) {
  return (
    <button
      onClick={onToggle}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        selected ? "border-primary bg-primary/20" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{name}</p>

          <p className="text-sm text-muted-foreground">{priceLabel}</p>
        </div>
      </div>
    </button>
  );
}
