import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const STATUSES = ["pending_payment", "paid", "fulfilled", "cancelled"] as const;

function formatGbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; deliveryDate?: string }>;
}) {
  const params = await searchParams;

  const where: Prisma.OrderWhereInput = {};
  if (params.status) where.status = params.status as Prisma.OrderWhereInput["status"];
  if (params.deliveryDate) {
    where.deliveryDate = new Date(`${params.deliveryDate}T00:00:00.000Z`);
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { deliveryDate: "asc" },
    include: { items: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <form method="GET" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Status
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="rounded-md border border-neutral-300 px-2 py-1"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Delivery date
          <input
            type="date"
            name="deliveryDate"
            defaultValue={params.deliveryDate ?? ""}
            className="rounded-md border border-neutral-300 px-2 py-1"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Filter
        </button>
        {(params.status || params.deliveryDate) && (
          <Link href="/admin/orders" className="text-sm text-neutral-600 underline">
            Clear
          </Link>
        )}
      </form>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-2 pr-4">Delivery date</th>
            <th className="py-2 pr-4">Plan</th>
            <th className="py-2 pr-4">Items</th>
            <th className="py-2 pr-4">Contact</th>
            <th className="py-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-neutral-100">
              <td className="py-2 pr-4">
                {order.deliveryDate.toISOString().slice(0, 10)}
              </td>
              <td className="py-2 pr-4">
                {order.planLabelSnapshot} ({formatGbp(order.planPriceGbpSnapshot)})
              </td>
              <td className="py-2 pr-4">{order.items.length}</td>
              <td className="py-2 pr-4">{order.contactName}</td>
              <td className="py-2 pr-4">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="underline hover:text-neutral-900"
                >
                  {order.status}
                </Link>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-neutral-500">
                No orders match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
