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
    <main className="min-h-screen bg-cream font-sans text-espresso antialiased">
      {/* Slim sticky brand bar — keeps the wordmark visible while scrolling
          past the dish grid/checkout form below. No nav links: this is a
          single-page flow with nowhere else for them to point to. */}
      <div className="sticky top-0 z-20 border-b border-card-border bg-cream/90 px-6 py-3 backdrop-blur-sm">
        <span className="font-serif text-lg font-medium text-espresso">
          Weekly Table
        </span>
      </div>

      <header className="border-b border-card-border px-6 py-10 text-center sm:py-14">
        <h1 className="font-serif text-4xl font-medium text-espresso sm:text-5xl">
          Weekly Table
        </h1>
        <p className="mx-auto mt-3 max-w-md text-espresso/70">
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
          deliveryWindowStart: cutoffConfig.deliveryWindowStart,
          deliveryWindowEnd: cutoffConfig.deliveryWindowEnd,
        }}
      />
    </main>
  );
}
