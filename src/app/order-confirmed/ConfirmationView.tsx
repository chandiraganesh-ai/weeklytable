"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type MealSummary = {
  dishName: string;
  deliveryDate: string;
};

type OrderSummary = {
  orderId: string;
  status: string;
  paymentMethod: "stripe" | "cash";
  planLabel: string;
  priceGbp: number;
  contactName: string;
  contactEmail: string;
  deliveryAddress: string;
  notes: string | null;
  meals: MealSummary[];
};

const MAX_POLL_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 1500;

export default function ConfirmationView() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    if (order?.status === "paid") return;
    // Cash orders never get a webhook — "pending_payment" is their normal
    // resting state until an admin manually marks them paid, not a
    // transient "still processing" state worth polling for.
    if (order?.paymentMethod === "cash") return;
    if (attempts >= MAX_POLL_ATTEMPTS) return;

    const timer = setTimeout(
      async () => {
        try {
          const res = await fetch(
            `/api/orders/by-session/${encodeURIComponent(sessionId)}`,
          );
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          const data = (await res.json()) as OrderSummary;
          setOrder(data);
        } finally {
          setAttempts((n) => n + 1);
        }
      },
      attempts === 0 ? 0 : POLL_INTERVAL_MS,
    );

    return () => clearTimeout(timer);
  }, [sessionId, attempts, order?.status, order?.paymentMethod]);

  if (!sessionId) {
    return <p className="text-neutral-600">No order reference was given.</p>;
  }

  if (notFound) {
    return (
      <p className="text-neutral-600">
        We couldn&apos;t find that order. If you were just charged, contact
        us and we&apos;ll sort it out.
      </p>
    );
  }

  if (!order || (order.paymentMethod !== "cash" && order.status === "pending_payment")) {
    const gaveUp = attempts >= MAX_POLL_ATTEMPTS;
    return (
      <p className="text-neutral-600">
        {gaveUp
          ? "Your payment is still processing. This can take a minute — check your email for a receipt, or contact us if you're unsure."
          : "Confirming your payment…"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-medium text-green-700">
        Thanks, {order.contactName.split(" ")[0]} — your order is confirmed
        {order.paymentMethod === "cash" ? " (cash on delivery)." : "."}
      </p>
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-neutral-500">Plan</dt>
          <dd>
            {order.planLabel} (£{(order.priceGbp / 100).toFixed(2)})
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-neutral-500">Meals</dt>
          <dd>
            <ul className="mt-1 flex flex-col gap-1">
              {order.meals.map((meal, i) => (
                <li key={i}>
                  <span className="font-medium">{meal.deliveryDate}</span> —{" "}
                  {meal.dishName}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-neutral-500">Delivering to</dt>
          <dd>{order.deliveryAddress}</dd>
        </div>
        {order.notes && (
          <div className="sm:col-span-2">
            <dt className="text-neutral-500">Notes</dt>
            <dd>{order.notes}</dd>
          </div>
        )}
      </dl>
      <p className="text-sm text-neutral-500">
        {order.paymentMethod === "cash"
          ? "Please have the exact amount ready — payment is collected on delivery."
          : `A confirmation has been sent to ${order.contactEmail}.`}
      </p>
    </div>
  );
}
