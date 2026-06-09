"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getRoomByCode } from "@/features/room/api/get-room-by-code";
import { fetchRoomSnapshot } from "@/features/room/api/fetch-room-snapshot";
import { calculateParticipantTotals } from "@/features/split/domain/calculate-participant-totals";

interface Room {
  id: string;
  code: string;
  service_fee_percent: number;
}

export default function SummaryPage() {
  const params = useParams();

  const [loading, setLoading] = useState(true);

  const [room, setRoom] = useState<Room | null>(null);

  const [totals, setTotals] = useState<any[]>([]);

  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    async function loadSummary() {
      try {
        const room = await getRoomByCode(params.code as string);

        const snapshot = await fetchRoomSnapshot(room.id);

        const totals = calculateParticipantTotals({
          participants: snapshot.participants,
          items: snapshot.items,
          itemConsumers: snapshot.itemConsumers,
          serviceFeePercent: room.service_fee_percent,
        });

        setRoom(room);

        setTotals(totals);

        const total = totals.reduce(
          (acc, current) => acc + current.totalCents,
          0,
        );

        setGrandTotal(total);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [params.code]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
        Carregando...
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
        Mesa não encontrada
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <div className="max-w-md mx-auto pt-10">
        <h1 className="text-3xl font-bold">Resumo da Conta</h1>

        <p className="mt-2 text-slate-400">Mesa {room.code}</p>

        <div className="mt-6 rounded-xl bg-slate-900 p-4">
          <div className="text-sm text-slate-400">Total da Mesa</div>

          <div className="mt-2 text-3xl font-bold">
            R$ {(grandTotal / 100).toFixed(2)}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {totals.map((total) => (
            <div
              key={total.participantId}
              className="rounded-xl bg-slate-900 p-4"
            >
              <div className="font-semibold">{total.nickname}</div>

              <div className="mt-2 text-slate-300">
                Total: R$ {(total.totalCents / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
