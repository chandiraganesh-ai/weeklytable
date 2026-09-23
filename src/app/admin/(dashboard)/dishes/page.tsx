import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleDishActive } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDishesPage() {
  const dishes = await prisma.dish.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dishes</h1>
        <Link
          href="/admin/dishes/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Add dish
        </Link>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Dietary tag</th>
            <th className="py-2 pr-4">Active</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {dishes.map((dish) => (
            <tr key={dish.id} className="border-b border-neutral-100">
              <td className="py-2 pr-4">{dish.name}</td>
              <td className="py-2 pr-4">{dish.category}</td>
              <td className="py-2 pr-4">{dish.dietaryTag ?? "—"}</td>
              <td className="py-2 pr-4">{dish.isActive ? "Yes" : "No"}</td>
              <td className="flex gap-3 py-2 pr-4">
                <Link
                  href={`/admin/dishes/${dish.id}`}
                  className="text-neutral-600 underline"
                >
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await toggleDishActive(dish.id, !dish.isActive);
                  }}
                >
                  <button type="submit" className="text-neutral-600 underline">
                    {dish.isActive ? "Deactivate" : "Activate"}
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
