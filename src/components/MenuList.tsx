"use client";

import { useMemo, useState } from "react";
import { CATEGORY_LABELS, DIETARY_TAG_LABELS } from "@/lib/dishOptions";
import type { Category, DietaryTag } from "@/generated/prisma/enums";

type DishView = {
  id: string;
  name: string;
  category: Category;
  dietaryTag: DietaryTag | null;
};

export default function MenuList({ dishes }: { dishes: DishView[] }) {
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [dietaryFilter, setDietaryFilter] = useState<DietaryTag | "all">("all");

  const categories = useMemo(() => {
    const seen = new Set(dishes.map((d) => d.category));
    return Array.from(seen);
  }, [dishes]);

  const dietaryTags = useMemo(() => {
    const seen = new Set(
      dishes.map((d) => d.dietaryTag).filter((t): t is DietaryTag => t !== null),
    );
    return Array.from(seen);
  }, [dishes]);

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = categoryFilter === "all" || dish.category === categoryFilter;
    const matchesDietary = dietaryFilter === "all" || dish.dietaryTag === dietaryFilter;
    return matchesCategory && matchesDietary;
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full border px-3 py-1 text-sm transition active:scale-95 ${
              categoryFilter === "all"
                ? "border-sage bg-sage text-white"
                : "border-card-border bg-white text-espresso hover:border-sage/50"
            }`}
          >
            All categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full border px-3 py-1 text-sm transition active:scale-95 ${
                categoryFilter === cat
                  ? "border-sage bg-sage text-white"
                  : "border-card-border bg-white text-espresso hover:border-sage/50"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDietaryFilter("all")}
            className={`rounded-full border px-3 py-1 text-sm transition active:scale-95 ${
              dietaryFilter === "all"
                ? "border-terracotta bg-terracotta text-white"
                : "border-card-border bg-white text-espresso hover:border-terracotta/50"
            }`}
          >
            All diets
          </button>
          {dietaryTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setDietaryFilter(tag)}
              className={`rounded-full border px-3 py-1 text-sm transition active:scale-95 ${
                dietaryFilter === tag
                  ? "border-terracotta bg-terracotta text-white"
                  : "border-card-border bg-white text-espresso hover:border-terracotta/50"
              }`}
            >
              {DIETARY_TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      {filteredDishes.length === 0 ? (
        <p className="mt-8 text-center text-sm text-espresso/75">
          No dishes match these filters.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-card-border bg-white px-4 py-3 shadow-sm"
            >
              <span className="font-medium text-espresso">{dish.name}</span>
              {dish.dietaryTag && (
                <span className="shrink-0 rounded-full bg-sage/10 px-2 py-0.5 text-xs font-medium text-sage">
                  {DIETARY_TAG_LABELS[dish.dietaryTag]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
