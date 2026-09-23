import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { togglePlanActive } from "./actions";

export const dynamic = "force-dynamic";

function formatGbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Plans</h1>
        <Link
          href="/admin/plans/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Add plan
        </Link>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-2 pr-4">Label</th>
            <th className="py-2 pr-4">Meals</th>
            <th className="py-2 pr-4">Price</th>
            <th className="py-2 pr-4">Active</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id} className="border-b border-neutral-100">
              <td className="py-2 pr-4">{plan.label}</td>
              <td className="py-2 pr-4">{plan.mealCount}</td>
              <td className="py-2 pr-4">{formatGbp(plan.priceGbp)}</td>
              <td className="py-2 pr-4">{plan.isActive ? "Yes" : "No"}</td>
              <td className="flex gap-3 py-2 pr-4">
                <Link
                  href={`/admin/plans/${plan.id}`}
                  className="text-neutral-600 underline"
                >
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await togglePlanActive(plan.id, !plan.isActive);
                  }}
                >
                  <button type="submit" className="text-neutral-600 underline">
                    {plan.isActive ? "Deactivate" : "Activate"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
