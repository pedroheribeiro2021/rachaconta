"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus, Receipt, Share2, Trash2, Users } from "lucide-react";

import { getRoomByCode } from "@/features/room/api/get-room-by-code";
import { createItem } from "@/features/room/api/create-item";
import { toggleItemConsumer } from "@/features/item-consumers/api/toggle-item-consumer";
import { calculateParticipantTotals } from "@/features/split/domain/calculate-participant-totals";
import { fetchRoomSnapshot } from "@/features/room/api/fetch-room-snapshot";
import { subscribeRoom } from "@/features/room/realtime/subscribe-room";
import { deleteItem } from "@/features/room/api/delete-item";
import { updateItem } from "@/features/room/api/update-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/logo";

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

  return (
    <main className="min-h-screen bg-background p-4 text-foreground">
      <div className="mx-auto max-w-md pt-10">
        <Logo className="mb-6 block text-2xl" />

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mesa {room.code}</h1>

            <p className="mt-1 text-muted-foreground">
              Taxa de serviço: {room.service_fee_percent}%
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {participants.length} participantes
            </div>
            <div className="text-sm text-muted-foreground">
              {items.length} itens
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/join/${room.code}`,
                  );

                  alert("Link copiado");
                }}
              >
                <Share2 />
                Copiar convite
              </Button>

              <Button variant="default" size="sm" asChild>
                <Link href={`/room/${room.code}/summary`}>
                  <Receipt />
                  Ver Resumo
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-card p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <Users className="size-4 text-primary" />
            Participantes
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-sm"
              >
                {participant.nickname}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-card p-4">
          <h2 className="font-semibold">Itens</h2>

          <div className="mt-3 flex flex-wrap gap-2">
            <Input
              data-testid="item-name-input"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item"
              className="min-w-0 flex-1"
            />

            <Input
              data-testid="item-price-input"
              type="text"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              placeholder="R$"
              className="w-24"
            />

            <Button data-testid="add-item-button" onClick={handleAddItem}>
              <Plus />
              <span className="hidden sm:inline">Adicionar Item</span>
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                data-testid={`item-${item.id}`}
                className="rounded-2xl border border-border bg-secondary/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>

                    <div className="text-sm text-muted-foreground">
                      R$ {(item.price_cents / 100).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      data-testid={`edit-item-${item.id}`}
                      size="icon-sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingItemId(item.id);

                        setEditingName(item.name);

                        setEditingPrice((item.price_cents / 100).toString());
                      }}
                    >
                      <Pencil />
                    </Button>

                    <Button
                      data-testid={`delete-item-${item.id}`}
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {participants.map((participant) => {
                    const selected = isSelected(item.id, participant.id);

                    return (
                      <label
                        key={participant.id}
                        className="flex cursor-pointer items-center justify-between rounded-xl bg-card px-3 py-2"
                      >
                        <span>{participant.nickname}</span>

                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            handleToggleConsumer(item.id, participant.id)
                          }
                          className="size-5 accent-primary"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-primary/40 bg-primary/15 p-4">
          <h2 className="font-semibold">Total da Mesa</h2>

          <div
            data-testid="room-total"
            className="mt-2 text-2xl font-bold text-primary"
          >
            R${" "}
            {(
              totals.reduce((acc, item) => acc + item.totalCents, 0) / 100
            ).toFixed(2)}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-card p-4">
          <h2 className="font-semibold">Totais</h2>

          <div className="mt-3 space-y-3">
            {totals.map((total) => (
              <div
                key={total.participantId}
                data-testid={`total-${total.participantId}`}
                className="rounded-2xl border border-border bg-secondary/60 p-4"
              >
                <div className="font-medium">{total.nickname}</div>

                <div className="mt-2 text-muted-foreground">
                  Subtotal: R$ {(total.subtotalCents / 100).toFixed(2)}
                </div>

                <div className="text-muted-foreground">
                  Taxa: R$ {(total.serviceFeeCents / 100).toFixed(2)}
                </div>

                <div className="mt-3 border-t border-border pt-2 text-lg font-bold text-foreground">
                  Total: R$ {(total.totalCents / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-5">
            <h2 className="text-xl font-semibold">Editar Item</h2>

            <div className="mt-4 space-y-3">
              <Input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
              />

              <Input
                type="text"
                value={editingPrice}
                onChange={(e) => setEditingPrice(e.target.value)}
              />
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                data-testid="cancel-item-button"
                type="button"
                variant="secondary"
                onClick={closeEditModal}
                className="flex-1"
              >
                Cancelar
              </Button>

              <Button
                data-testid="save-item-button"
                type="button"
                onClick={handleSaveEdit}
                className="flex-1"
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
