"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.digest ? `Reference: ${error.digest}` : "This page failed to render."}</p>
      <button className="mt-6 underline" onClick={reset}>Try again</button>
    </main>
  );
}
