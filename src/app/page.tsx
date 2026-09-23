import { prisma } from "@/lib/prisma";
import MenuBrowser from "@/components/MenuBrowser";

// Menu content is admin-editable (dishes, plans, cutoff config) and must
// reflect changes immediately without a redeploy — never statically cache
// this page.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [dishes, plans, cutoffConfig] = await Promise.all([
    prisma.dish.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        dietaryTag: true,
        description: true,
        imageUrl: true,
        availableDays: true,
      },
    }),
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, label: true, mealCount: true, priceGbp: true },
    }),
    prisma.cutoffConfig.findUniqueOrThrow({ where: { id: "default" } }),
  ]);

  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 p-6 text-center">
        <h1 className="text-3xl font-semibold">Weekly Table</h1>
        <p className="mt-1 text-neutral-600">
          Pre-order home-cooked meals for delivery, chosen by the week.
        </p>
      </header>

      <MenuBrowser
        dishes={dishes}
        plans={plans}
        cutoffConfig={{
          leadDays: cutoffConfig.leadDays,
          cutoffTime: cutoffConfig.cutoffTime,
          timezone: cutoffConfig.timezone,
        }}
      />
    </main>
  );
}
