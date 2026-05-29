interface Props {
  nickname: string;

  totalLabel: string;
}

export function ParticipantTotal({ nickname, totalLabel }: Props) {
  return (
    <div
      className="
      rounded-2xl
      bg-slate-900
      p-4
    "
    >
      <div
        className="
        flex
        items-center
        justify-between
      "
      >
        <span
          className="
          text-slate-300
        "
        >
          {nickname}
        </span>

        <strong
          className="
          text-violet-400
        "
        >
          {totalLabel}
        </strong>
      </div>
    </div>
  );
}
