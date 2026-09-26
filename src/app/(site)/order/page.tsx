import { prisma } from "@/lib/prisma";
import MenuBrowser from "@/components/MenuBrowser";

// Menu content is admin-editable (dishes, plans, cutoff config) and must
// reflect changes immediately without a redeploy — never statically cache
// this page.
export const dynamic = "force-dynamic";

export default async function OrderPage() {
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
    <>
      <header className="border-b border-card-border px-6 py-10 text-center sm:py-14">
        <h1 className="font-serif text-4xl font-medium text-espresso sm:text-5xl">
          Choose your week
        </h1>
        <p className="mx-auto mt-3 max-w-md text-espresso/70">
          Pick a plan, choose your meals, and tell us when you&apos;d like
          them delivered.
        </p>
      </header>

      <MenuBrowser
        dishes={dishes}
        plans={plans}
        cutoffConfig={{
          leadDays: cutoffConfig.leadDays,
          cutoffTime: cutoffConfig.cutoffTime,
          timezone: cutoffConfig.timezone,
          deliveryWindowStart: cutoffConfig.deliveryWindowStart,
          deliveryWindowEnd: cutoffConfig.deliveryWindowEnd,
        }}
      />
    </>
  );
}
