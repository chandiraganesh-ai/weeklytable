import { Suspense } from "react";
import Link from "next/link";
import ConfirmationView from "./ConfirmationView";

export default function OrderConfirmedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 bg-cream p-8 font-sans text-espresso antialiased">
      <h1 className="font-serif text-2xl font-semibold text-espresso">
        Order confirmation
      </h1>
      <div className="rounded-xl border border-card-border bg-white p-6 shadow-sm">
        <Suspense fallback={<p className="text-espresso/60">Loading…</p>}>
          <ConfirmationView />
        </Suspense>
      </div>
      <Link
        href="/"
        className="mt-2 self-start rounded-full border border-card-border px-4 py-2 text-sm font-medium text-espresso transition hover:border-terracotta hover:text-terracotta"
      >
        ← Back to home
      </Link>
    </main>
  );
}
