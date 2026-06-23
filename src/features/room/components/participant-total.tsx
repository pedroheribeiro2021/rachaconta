interface Props {
  nickname: string;

  totalLabel: string;
}

export function ParticipantTotal({ nickname, totalLabel }: Props) {
  return (
    <div className="rounded-2xl bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-foreground/80">{nickname}</span>

        <strong className="text-primary">{totalLabel}</strong>
      </div>
    </div>
  );
}
