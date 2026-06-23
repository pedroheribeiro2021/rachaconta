"use client";

export default function ErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold">Algo deu errado</h1>

        <p className="text-muted-foreground">Tente novamente.</p>
      </div>
    </main>
  );
}
