"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createRoom } from "@/features/room/api/create-room";
import { ensureAnonymousAuth } from "@/lib/supabase/auth";
import { Logo } from "@/components/shared/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateRoom() {
    if (!nickname.trim()) {
      alert("Informe um apelido");
      return;
    }

    try {
      setLoading(true);

      const session = await ensureAnonymousAuth();

      const authId = session.user.id;

      const result = await createRoom(nickname.trim(), authId);

      router.push(`/room/${result.room.code}`);
    } catch (error) {
      console.error(error);

      alert("Erro ao criar mesa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-md pt-16">
        <Logo className="mb-2 block text-4xl" />

        <p className="mb-8 text-muted-foreground">
          Divida a conta com seus amigos sem complicação.
        </p>

        <Input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Seu apelido"
          className="mb-4 h-12"
        />

        <Button
          disabled={loading}
          onClick={handleCreateRoom}
          size="lg"
          className="h-12 w-full text-base font-semibold"
        >
          {loading ? "Criando..." : "Criar Mesa"}
        </Button>
      </div>
    </main>
  );
}
