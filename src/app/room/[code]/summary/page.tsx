"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getRoomByCode } from "@/features/room/api/get-room-by-code";
import { fetchRoomSnapshot } from "@/features/room/api/fetch-room-snapshot";
import { calculateParticipantTotals } from "@/features/split/domain/calculate-participant-totals";

export default function RoomSummaryPage() {
  const params = useParams();

  const [loading, setLoading] = useState(true);

  const [room, setRoom] = useState<any>(null);

  const [totals, setTotals] = useState<any[]>([]);

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

  const grandTotal =
    totals.reduce((acc, item) => acc + item.totalCents, 0) / 100;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <div className="max-w-md mx-auto pt-10">
        <h1 className="text-3xl font-bold">Resumo da Mesa</h1>

        <p className="mt-2 text-slate-400">Código: {room.code}</p>

        <div className="mt-6 space-y-3">
          {totals.map((total) => (
            <div
              key={total.participantId}
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                p-4
              "
            >
              <div className="font-medium">{total.nickname}</div>

              <div className="mt-2 text-slate-400">
                Subtotal: R$ {(total.subtotalCents / 100).toFixed(2)}
              </div>

              <div className="text-slate-400">
                Taxa: R$ {(total.serviceFeeCents / 100).toFixed(2)}
              </div>

              <div
                className="
                  mt-2
                  text-xl
                  font-bold
                  text-green-400
                "
              >
                R$ {(total.totalCents / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div
          className="
            mt-6
            rounded-xl
            bg-green-950
            p-4
          "
        >
          <div className="text-green-300">Total da Mesa</div>

          <div
            className="
              text-3xl
              font-bold
              text-green-400
            "
          >
            R$ {grandTotal.toFixed(2)}
          </div>
        </div>
      </div>
    </main>
  );
}
