// Starter seed data — placeholder content only. Real menu/pricing is a
// separate decision (see the plan's "Explicitly out of scope"); this just
// gives the system something real to query while the ordering flow and
// admin panel are being built.

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Weekday } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const dishes = [
  {
    name: "Roast Chicken & Root Vegetables",
    category: "classics",
    dietaryTag: "high-protein",
    description:
      "Slow-roasted chicken thigh with carrots, parsnips, and a herb gravy.",
    imageUrl: "/dishes/placeholder.svg",
  },
  {
    name: "Beef & Ale Stew",
    category: "classics",
    dietaryTag: null,
    description: "Braised beef, root vegetables, and a rich ale gravy.",
    imageUrl: "/dishes/placeholder.svg",
  },
  {
    name: "Mushroom & Spinach Risotto",
    category: "classics",
    dietaryTag: "vegetarian",
    description: "Creamy arborio rice with wild mushrooms and spinach.",
    imageUrl: "/dishes/placeholder.svg",
  },
  {
    name: "Chicken Tikka Masala",
    category: "italian",
    dietaryTag: "gluten-free",
    description: "Marinated chicken in a spiced tomato and cream sauce, with rice.",
    imageUrl: "/dishes/placeholder.svg",
  },
  {
    name: "Katsu Curry Bowl",
    category: "bowls",
    dietaryTag: "high-protein",
    description: "Panko-crumbed chicken, katsu curry sauce, and steamed rice.",
    imageUrl: "/dishes/placeholder.svg",
    // Demonstrates day-restriction: a weekday-only kitchen special.
    availableDays: [
      Weekday.monday,
      Weekday.tuesday,
      Weekday.wednesday,
      Weekday.thursday,
      Weekday.friday,
    ],
  },
  {
    name: "Vegetable Stir-Fry Bowl",
    category: "bowls",
    dietaryTag: "vegetarian",
    description: "Seasonal vegetables wok-tossed in a light soy-ginger sauce.",
    imageUrl: "/dishes/placeholder.svg",
  },
  {
    name: "Chilli Con Carne",
    category: "mexican",
    dietaryTag: "high-protein",
    description: "Slow-cooked beef and bean chilli with rice.",
    imageUrl: "/dishes/placeholder.svg",
    // Demonstrates day-restriction: a weekend-only special.
    availableDays: [Weekday.saturday, Weekday.sunday],
  },
];

const plans = [
  { label: "1 Meal a Week", mealCount: 1, priceGbp: 1000, sortOrder: 1 },
  { label: "3 Meals a Week", mealCount: 3, priceGbp: 2700, sortOrder: 2 },
  { label: "5 Meals a Week", mealCount: 5, priceGbp: 4000, sortOrder: 3 },
];

async function main() {
  for (const dish of dishes) {
    await prisma.dish.upsert({
      where: { name: dish.name },
      update: dish,
      create: dish,
    });
  }

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({
      where: { mealCount: plan.mealCount },
    });
    if (existing) {
      await prisma.plan.update({ where: { id: existing.id }, data: plan });
    } else {
      await prisma.plan.create({ data: plan });
    }
  }

  await prisma.cutoffConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      leadDays: 1,
      cutoffTime: "18:00",
      timezone: "Europe/London",
    },
  });

  console.log(
    `Seeded ${dishes.length} dishes, ${plans.length} plans, and the default cutoff config.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
