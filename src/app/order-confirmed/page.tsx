import { Suspense } from "react";
import ConfirmationView from "./ConfirmationView";

export default function OrderConfirmedPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Order confirmation</h1>
      <Suspense fallback={<p className="text-neutral-600">Loading…</p>}>
        <ConfirmationView />
      </Suspense>
    </main>
  );
}
