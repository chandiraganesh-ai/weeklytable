import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { setOrderStatus } from "../actions";

export const dynamic = "force-dynamic";

function formatGbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, plan: true },
  });

  if (!order) notFound();

  const canMarkFulfilled = order.status === "paid";
  const canCancel = order.status === "pending_payment" || order.status === "paid";

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Link href="/admin/orders" className="text-sm text-neutral-600 underline">
        ← Back to orders
      </Link>

      <h1 className="text-2xl font-semibold">Order</h1>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-neutral-500">Status</dt>
          <dd className="font-medium">{order.status}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Delivery date</dt>
          <dd>{order.deliveryDate.toISOString().slice(0, 10)}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Plan</dt>
          <dd>
            {order.planLabelSnapshot} ({formatGbp(order.planPriceGbpSnapshot)})
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Placed</dt>
          <dd>{order.createdAt.toISOString()}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-neutral-500">Contact</dt>
          <dd>
            {order.contactName} · {order.contactPhone} · {order.contactEmail}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-neutral-500">Delivery address</dt>
          <dd>{order.deliveryAddress}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-neutral-500">Dishes</dt>
          <dd>
            <ul className="list-disc pl-5">
              {order.items.map((item) => (
                <li key={item.id}>{item.dishNameSnapshot}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-neutral-500">Stripe</dt>
          <dd className="break-all text-xs text-neutral-500">
            Session: {order.stripeCheckoutSessionId}
            <br />
            Payment intent: {order.stripePaymentIntentId ?? "—"}
          </dd>
        </div>
      </dl>

      <div className="flex gap-3 border-t border-neutral-200 pt-4">
        {canMarkFulfilled && (
          <form
            action={async () => {
              "use server";
              await setOrderStatus(order.id, "fulfilled");
            }}
          >
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            >
              Mark fulfilled
            </button>
          </form>
        )}
        {canCancel && (
          <form
            action={async () => {
              "use server";
              await setOrderStatus(order.id, "cancelled");
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
            >
              Cancel order
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
