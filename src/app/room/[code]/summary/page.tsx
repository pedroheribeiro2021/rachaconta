"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getRoomByCode } from "@/features/room/api/get-room-by-code";
import { fetchRoomSnapshot } from "@/features/room/api/fetch-room-snapshot";
import { calculateParticipantTotals } from "@/features/split/domain/calculate-participant-totals";
import { Room } from "@/features/room/types/room.types";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

type Total = {
  participantId: string;
  nickname: string;
  subtotalCents: number;
  serviceFeeCents: number;
  totalCents: number;
};

export default function RoomSummaryPage() {
  const params = useParams();

  const [loading, setLoading] = useState(true);

  const [room, setRoom] = useState<Room | null>(null);

  const [totals, setTotals] = useState<Total[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const room = await getRoomByCode(params.code as string);

        const snapshot = await fetchRoomSnapshot(room.id);

        const totals = calculateParticipantTotals({
          participants: snapshot.participants,
          items: snapshot.items,
          itemConsumers: snapshot.itemConsumers,
          serviceFeePercent: snapshot.room.service_fee_percent,
        });

        setRoom(snapshot.room);

        setTotals(totals);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.code]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 text-foreground">
        Carregando...
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-background p-4 text-foreground">
        Mesa não encontrada
      </main>
    );
  }

  const grandTotal =
    totals.reduce((acc, item) => acc + item.totalCents, 0) / 100;

  return (
    <main className="min-h-screen bg-background p-4 text-foreground">
      <div className="mx-auto max-w-md pt-10">
        <Button variant="secondary" size="sm" asChild className="mb-6">
          <Link href={`/room/${room.code}`}>
            <ArrowLeft />
            Voltar para a mesa
          </Link>
        </Button>

        <Logo className="mb-6 block text-2xl" />

        <h1 className="text-3xl font-bold">Resumo da Mesa</h1>

        <p className="mt-2 text-muted-foreground">Código: {room.code}</p>

        <div className="mt-6 space-y-3">
          {totals.map((total) => (
            <div
              key={total.participantId}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="font-medium">{total.nickname}</div>

              <div className="mt-2 text-muted-foreground">
                Subtotal: R$ {(total.subtotalCents / 100).toFixed(2)}
              </div>

              <div className="text-muted-foreground">
                Taxa: R$ {(total.serviceFeeCents / 100).toFixed(2)}
              </div>

              <div className="mt-2 text-xl font-bold text-primary">
                R$ {(total.totalCents / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-primary/15 p-4">
          <div className="text-primary">Total da Mesa</div>

          <div className="text-3xl font-bold text-primary">
            R$ {grandTotal.toFixed(2)}
          </div>
        </div>
      </div>
    </main>
  );
}
