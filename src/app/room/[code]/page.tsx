"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getRoomByCode } from "@/features/room/api/get-room-by-code";

interface Room {
  id: string;
  code: string;
  service_fee_percent: number;
}

export default function RoomPage() {
  const params = useParams();

  const [room, setRoom] = useState<Room | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoom() {
      try {
        const room = await getRoomByCode(params.code as string);

        setRoom(room);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRoom();
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
        <h1 className="text-3xl font-bold">Mesa {room.code}</h1>

        <p className="mt-4 text-slate-400">
          Taxa de serviço: {room.service_fee_percent}%
        </p>

        <div className="mt-8 rounded-xl bg-slate-900 p-4">
          <h2 className="font-semibold">Participantes</h2>

          <p className="mt-2 text-slate-400">Ainda não carregados</p>
        </div>

        <div className="mt-4 rounded-xl bg-slate-900 p-4">
          <h2 className="font-semibold">Itens</h2>

          <p className="mt-2 text-slate-400">Nenhum item adicionado</p>
        </div>
      </div>
    </main>
  );
}
