"use client";

import { useState } from "react";

import { generateRoomCode } from "@/lib/utils/generate-room-code";

export default function HomePage() {
  const [nickname, setNickname] = useState("");

  async function handleCreateRoom() {
    const roomCode = generateRoomCode();

    console.log({
      nickname,
      roomCode,
    });
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
          onClick={handleCreateRoom}
          className="
            w-full
            rounded-xl
            bg-violet-600
            py-3
            font-semibold
          "
        >
          Criar Mesa
        </button>
      </div>
    </main>
  );
}
