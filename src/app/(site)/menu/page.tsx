import { prisma } from "@/lib/prisma";
import MenuList from "@/components/MenuList";

// A browsable, read-only menu — no ordering here (that's /order). Must stay
// live, same as the order page, since dishes change via the admin panel.
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const dishes = await prisma.dish.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, category: true, dietaryTag: true },
  });

  return (
    <>
      <header className="border-b border-card-border px-6 py-10 text-center sm:py-14">
        <h1 className="font-serif text-4xl font-medium text-espresso sm:text-5xl">
          Our menu
        </h1>
        <p className="mx-auto mt-3 max-w-md text-espresso/85">
          Browse everything we make. Filter by category or dietary need —
          ready to order? Head to the order page.
        </p>
      </header>

      <MenuList dishes={dishes} />
    </>
  );
}
