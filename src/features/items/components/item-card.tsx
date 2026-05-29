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
      className={`
        w-full
        rounded-2xl
        border
        p-4
        text-left
        transition-all

        ${
          selected
            ? `
              border-violet-500
              bg-violet-500/20
            `
            : `
              border-slate-800
              bg-slate-900
            `
        }
      `}
    >
      <div
        className="
        flex
        items-center
        justify-between
      "
      >
        <div>
          <p className="font-semibold">{name}</p>

          <p
            className="
            text-sm
            text-slate-400
          "
          >
            {priceLabel}
          </p>
        </div>
      </div>
    </button>
  );
}
