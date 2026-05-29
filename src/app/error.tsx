"use client";

export default function ErrorPage() {
  return (
    <main
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-slate-950
      text-slate-100
      p-6
    "
    >
      <div
        className="
        text-center
      "
      >
        <h1
          className="
          text-2xl
          font-bold
          mb-2
        "
        >
          Algo deu errado
        </h1>

        <p
          className="
          text-slate-400
        "
        >
          Tente novamente.
        </p>
      </div>
    </main>
  );
}
