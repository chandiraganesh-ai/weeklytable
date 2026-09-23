import { Suspense } from "react";
import Link from "next/link";
import ConfirmationView from "./ConfirmationView";

export default function OrderConfirmedPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Order confirmation</h1>
      <Suspense fallback={<p className="text-neutral-600">Loading…</p>}>
        <ConfirmationView />
      </Suspense>
      <Link
        href="/"
        className="mt-2 self-start rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:border-neutral-500"
      >
        ← Back to home
      </Link>
    </main>
  );
}
