"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { ensureAnonymousAuth } from "@/lib/supabase/auth";
import { joinRoom } from "@/features/room/api/join-room";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      <div className="max-w-md mx-auto pt-16">
        <h1 className="text-3xl font-bold mb-4">Entrar na mesa</h1>

        <p className="text-slate-400 mb-6">Código: {params.code}</p>

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
          onClick={handleJoinRoom}
          className="
            w-full
            rounded-xl
            bg-violet-600
            py-3
            font-semibold
          "
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </main>
  );
}
