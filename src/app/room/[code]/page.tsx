"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getRoomByCode } from "@/features/room/api/get-room-by-code";
import { createItem } from "@/features/room/api/create-item";
import { toggleItemConsumer } from "@/features/item-consumers/api/toggle-item-consumer";
import { calculateParticipantTotals } from "@/features/split/domain/calculate-participant-totals";
import { fetchRoomSnapshot } from "@/features/room/api/fetch-room-snapshot";
import { subscribeRoom } from "@/features/room/realtime/subscribe-room";
import Link from "next/link";
import { deleteItem } from "@/features/room/api/delete-item";
import { updateItem } from "@/features/room/api/update-item";

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

interface ItemConsumer {
  item_id: string;
  participant_id: string;
}

export default function RoomPage() {
  const params = useParams();

  const [room, setRoom] = useState<Room | null>(null);

  const [loading, setLoading] = useState(true);

  const [participants, setParticipants] = useState<Participant[]>([]);

  const [items, setItems] = useState<Item[]>([]);

  const [itemConsumers, setItemConsumers] = useState<ItemConsumer[]>([]);

  const [itemName, setItemName] = useState("");

  const [itemPrice, setItemPrice] = useState("");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [editingName, setEditingName] = useState("");

  const [editingPrice, setEditingPrice] = useState("");

  async function refreshRoom(roomId: string) {
    const snapshot = await fetchRoomSnapshot(roomId);

    setRoom(snapshot.room);

    setParticipants(snapshot.participants);

    setItems(snapshot.items);

    setItemConsumers(snapshot.itemConsumers);
  }

  useEffect(() => {
    async function loadRoom() {
      try {
        const room = await getRoomByCode(params.code as string);

        await refreshRoom(room.id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRoom();
  }, [params.code]);

  useEffect(() => {
    if (!room) {
      return;
    }

    const unsubscribe = subscribeRoom(room.id, async () => {
      await refreshRoom(room.id);
    });

    return () => {
      unsubscribe();
    };
  }, [room]);

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

    await createItem({
      roomId: room.id,
      name: itemName.trim(),
      priceCents: Math.round(value * 100),
    });

    await refreshRoom(room.id);

    setItemName("");
    setItemPrice("");
  }

  async function handleSaveEdit() {
    if (!editingItemId || !room) {
      return;
    }

    const value = Number(editingPrice.replace(",", "."));

    if (Number.isNaN(value)) {
      console.log("VALOR INVALIDO");
      return;
    }

    await updateItem({
      itemId: editingItemId,
      name: editingName,
      priceCents: Math.round(value * 100),
    });

    closeEditModal();

    await refreshRoom(room.id);
  }

  function closeEditModal() {
    setEditingItemId(null);

    setEditingName("");

    setEditingPrice("");
  }

  async function handleDeleteItem(itemId: string) {
    if (!room) {
      return;
    }

    const confirmed = confirm("Excluir este item?");

    if (!confirmed) {
      return;
    }

    await deleteItem(itemId);

    await refreshRoom(room.id);
  }

  function isSelected(itemId: string, participantId: string) {
    return itemConsumers.some(
      (consumer) =>
        consumer.item_id === itemId &&
        consumer.participant_id === participantId,
    );
  }

  async function handleToggleConsumer(itemId: string, participantId: string) {
    const selected = isSelected(itemId, participantId);

    try {
      await toggleItemConsumer({
        itemId,
        participantId,
        selected,
      });

      await refreshRoom(room!.id);
    } catch (error) {
      console.error(error);
    }
  }

  const totals = room
    ? calculateParticipantTotals({
        participants,
        items,
        itemConsumers,
        serviceFeePercent: room.service_fee_percent,
      })
    : [];

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mesa {room.code}</h1>

            <p className="mt-1 text-slate-400">
              Taxa de serviço: {room.service_fee_percent}%
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-slate-300">
              {participants.length} participantes
            </div>
            <div className="text-sm text-slate-300">{items.length} itens</div>

            <div className="mt-2 flex gap-2 justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/join/${room.code}`,
                  );

                  alert("Link copiado");
                }}
                className="rounded-lg bg-slate-800 px-3 py-2 text-sm"
              >
                Copiar convite
              </button>

              <Link
                href={`/room/${room.code}/summary`}
                className="rounded-lg bg-green-700 px-3 py-2 text-sm"
              >
                Ver Resumo
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-slate-900 p-4">
          <h2 className="font-semibold">Participantes</h2>

          <div className="mt-2 flex flex-wrap gap-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="rounded-full bg-blue-900/40 border border-blue-700 px-3 py-1 text-sm"
              >
                {participant.nickname}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-900 p-4">
          <h2 className="font-semibold">Itens</h2>

          <div className="mt-2 flex flex-wrap gap-2">
            <input
              data-testid="item-name-input"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item"
              className="flex-1 min-w-0 rounded-lg bg-slate-800 px-3 py-2"
            />

            <input
              data-testid="item-price-input"
              type="text"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              placeholder="R$"
              className="w-24 rounded-lg bg-slate-800 px-3 py-2"
            />

            <button
              data-testid="add-item-button"
              onClick={handleAddItem}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700 whitespace-nowrap"
            >
              <span className="inline sm:hidden">+</span>
              <span className="hidden sm:inline">Adicionar Item</span>
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                data-testid={`item-${item.id}`}
                className="
  rounded-xl
  border
  border-slate-700
  bg-slate-800
  p-4
  shadow
"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>

                    <div className="text-sm text-slate-400">
                      R$ {(item.price_cents / 100).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      data-testid={`edit-item-${item.id}`}
                      onClick={() => {
                        setEditingItemId(item.id);

                        setEditingName(item.name);

                        setEditingPrice((item.price_cents / 100).toString());
                      }}
                      className="rounded bg-blue-600 px-2 py-1 text-sm"
                    >
                      Editar
                    </button>

                    <button
                      data-testid={`delete-item-${item.id}`}
                      onClick={() => handleDeleteItem(item.id)}
                      className="rounded bg-red-600 px-2 py-1 text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {participants.map((participant) => {
                    const selected = isSelected(item.id, participant.id);

                    return (
                      <label
                        key={participant.id}
                        className="
    flex
    items-center
    justify-between
    rounded-lg
    bg-slate-700/60
    px-3
    py-2
    cursor-pointer
  "
                      >
                        <span>{participant.nickname}</span>

                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            handleToggleConsumer(item.id, participant.id)
                          }
                          className="h-5 w-5"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-blue-700 bg-blue-900/20 p-4">
          <h2 className="font-semibold">Total da Mesa</h2>

          <div
            data-testid="room-total"
            className="mt-2 text-2xl font-bold text-blue-300"
          >
            R${" "}
            {(
              totals.reduce((acc, item) => acc + item.totalCents, 0) / 100
            ).toFixed(2)}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-900 p-4">
          <h2 className="font-semibold">Totais</h2>

          <div className="mt-2 space-y-3">
            {totals.map((total) => (
              <div
                key={total.participantId}
                data-testid={`total-${total.participantId}`}
                className="
  rounded-xl
  border
  border-slate-700
  bg-slate-800
  p-4
"
              >
                <>
                  <div className="font-medium">{total.nickname}</div>

                  <div className="mt-2 text-slate-300">
                    Subtotal: R$ {(total.subtotalCents / 100).toFixed(2)}
                  </div>

                  <div className="text-slate-300">
                    Taxa: R$ {(total.serviceFeeCents / 100).toFixed(2)}
                  </div>

                  <div className="text-slate-100 font-bold text-lg mt-3 pt-2 border-t border-slate-700">
                    Total: R$ {(total.totalCents / 100).toFixed(2)}
                  </div>
                </>
              </div>
            ))}
          </div>
        </div>
      </div>
      {editingItemId && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-xl
              bg-slate-900
              p-5
            "
          >
            <h2 className="text-xl font-semibold">Editar Item</h2>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="
                  w-full
                  rounded-lg
                  bg-slate-800
                  px-3
                  py-2
                "
              />

              <input
                type="text"
                value={editingPrice}
                onChange={(e) => setEditingPrice(e.target.value)}
                className="
                  w-full
                  rounded-lg
                  bg-slate-800
                  px-3
                  py-2
                "
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                data-testid="cancel-item-button"
                type="button"
                onClick={closeEditModal}
                className="
                  flex-1
                  rounded-lg
                  bg-slate-700
                  px-3
                  py-2
                "
              >
                Cancelar
              </button>

              <button
                data-testid="save-item-button"
                type="button"
                onClick={handleSaveEdit}
                className="
                  flex-1
                  rounded-lg
                  bg-blue-600
                  px-3
                  py-2
                  font-semibold
                "
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
