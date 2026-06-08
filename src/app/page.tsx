"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createRoom } from "@/features/room/api/create-room";
import { ensureAnonymousAuth } from "@/lib/supabase/auth";
import Link from "next/link";

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
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <div className="max-w-md mx-auto pt-16">
        <h1 className="text-4xl font-bold mb-8">RachaConta</h1>

        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Seu apelido"
          className="
            w-full
            rounded-xl
            bg-slate-800
            px-4
            py-3
            mb-4
          "
        />

        <button
          disabled={loading}
          onClick={handleCreateRoom}
          className="
            w-full
            rounded-xl
            bg-violet-600
            py-3
            font-semibold
          "
        >
          {loading ? "Criando..." : "Criar Mesa"}
        </button>
        <button
          style={{ marginTop: "1rem" }}
          className="
            w-full
            rounded-xl
            bg-violet-600
            py-3
            font-semibold
          "
        >
          <Link href="/join">Entrar em Mesa</Link>
        </button>
      </div>
    </main>
  );
}
