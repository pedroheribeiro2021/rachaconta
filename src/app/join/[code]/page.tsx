"use client";

import { useParams } from "next/navigation";

export default function JoinPage() {
  const params = useParams();

  return (
    <main
      className="
      min-h-screen
      bg-slate-950
      text-slate-100
      p-4
    "
    >
      <div
        className="
        max-w-md
        mx-auto
        pt-16
      "
      >
        <h1
          className="
          text-3xl
          font-bold
          mb-4
        "
        >
          Entrar na mesa
        </h1>

        <p
          className="
          text-slate-400
        "
        >
          Código: {params.code}
        </p>
      </div>
    </main>
  );
}
