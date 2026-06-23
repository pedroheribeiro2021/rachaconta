"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { ensureAnonymousAuth } from "@/lib/supabase/auth";
import { joinRoom } from "@/features/room/api/join-room";
import { getRoomByCode } from "@/features/room/api/get-room-by-code";
import { getParticipantByRoomAndAuth } from "@/features/room/api/get-participant-by-room-and-auth";
import { Logo } from "@/components/shared/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingReentry, setCheckingReentry] = useState(true);

  useEffect(() => {
    async function checkReentry() {
      try {
        const session = await ensureAnonymousAuth();

        const room = await getRoomByCode(params.code as string);

        const existingParticipant = await getParticipantByRoomAndAuth(
          room.id,
          session.user.id,
        );

        if (existingParticipant) {
          router.replace(`/room/${params.code}`);
          return;
        }
      } catch (error) {
        console.error(error);
      }

      setCheckingReentry(false);
    }

    checkReentry();
  }, [params.code, router]);

  async function handleJoinRoom() {
    if (!nickname.trim()) {
      alert("Informe um apelido");
      return;
    }

    try {
      setLoading(true);

      const session = await ensureAnonymousAuth();

      await joinRoom(params.code as string, nickname.trim(), session.user.id);

      router.push(`/room/${params.code}`);
    } catch (error) {
      console.error(error);

      alert("Erro ao entrar na mesa");
    } finally {
      setLoading(false);
    }
  }

  if (checkingReentry) {
    return (
      <main className="min-h-screen bg-background p-4 text-foreground">
        Carregando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-md pt-16">
        <Logo className="mb-6 block text-3xl" />

        <h1 className="mb-1 text-2xl font-semibold">Entrar na mesa</h1>

        <p className="mb-6 text-muted-foreground">
          Código: <span className="text-foreground">{params.code}</span>
        </p>

        <Input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Seu apelido"
          className="mb-4 h-12"
        />

        <Button
          disabled={loading}
          onClick={handleJoinRoom}
          size="lg"
          className="h-12 w-full text-base font-semibold"
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </div>
    </main>
  );
}
