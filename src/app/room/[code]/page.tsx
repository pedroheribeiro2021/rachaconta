"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getRoomByCode } from "@/features/room/api/get-room-by-code";
import { getParticipantsByRoom } from "@/features/room/api/get-participants-by-room";
import { getItemsByRoom } from "@/features/room/api/get-items-by-room";
import { createItem } from "@/features/room/api/create-item";

interface Room {
  id: string;
  code: string;
  service_fee_percent: number;
}

interface Participant {
  id: string;
  nickname: string;
}

interface Item {
  id: string;
  name: string;
  price_cents: number;
}

export default function RoomPage() {
  const params = useParams();

  const [room, setRoom] = useState<Room | null>(null);

  const [loading, setLoading] = useState(true);

  const [participants, setParticipants] = useState<Participant[]>([]);

  const [items, setItems] = useState<Item[]>([]);

  const [itemName, setItemName] = useState("");

  const [itemPrice, setItemPrice] = useState("");

  useEffect(() => {
    async function loadRoom() {
      try {
        const room = await getRoomByCode(params.code as string);

        setRoom(room);

        const participants = await getParticipantsByRoom(room.id);

        setParticipants(participants);

        const items = await getItemsByRoom(room.id);

        setItems(items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRoom();
  }, [params.code]);

  async function handleAddItem() {
    if (!room) return;

    if (!itemName.trim()) {
      return;
    }

    const normalized = itemPrice.replace(",", ".");

    const value = Number(normalized);

    if (Number.isNaN(value)) {
      return;
    }

    const item = await createItem({
      roomId: room.id,
      name: itemName.trim(),
      priceCents: Math.round(value * 100),
    });

    setItems((current) => [...current, item]);

    setItemName("");
    setItemPrice("");
  }

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

          <div className="mt-2 space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="
          rounded-lg
          bg-slate-800
          px-3
          py-2
        "
              >
                {participant.nickname}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-900 p-4">
          <h2 className="font-semibold">Itens</h2>

          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Nome do item"
              className="w-full rounded-lg bg-slate-800 px-3 py-2"
            />

            <input
              type="text"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              placeholder="Valor"
              className="w-full rounded-lg bg-slate-800 px-3 py-2"
            />

            <button
              onClick={handleAddItem}
              className="w-full rounded-lg bg-blue-600 px-3 py-2 font-semibold hover:bg-blue-700"
            >
              Adicionar Item
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2"
              >
                <span>{item.name}</span>
                <span className="text-slate-300">
                  R$ {(item.price_cents / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
