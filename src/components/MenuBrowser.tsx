"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  getNextEligibleDate,
  getWeekday,
  type CutoffConfigLike,
  type WeekdayName,
} from "@/lib/cutoff";

export type DishView = {
  id: string;
  name: string;
  category: string;
  dietaryTag: string | null;
  description: string;
  imageUrl: string;
  availableDays: WeekdayName[];
};

const WEEKDAY_LABELS: Record<WeekdayName, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

export type PlanView = {
  id: string;
  label: string;
  mealCount: number;
  priceGbp: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  classics: "Classics",
  italian: "Italian & Mediterranean",
  bowls: "Bowls",
  mexican: "Mexican",
};

function formatGbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

export default function MenuBrowser({
  dishes,
  plans,
  cutoffConfig,
}: {
  dishes: DishView[];
  plans: PlanView[];
  cutoffConfig: CutoffConfigLike;
}) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    plans[0]?.id ?? null,
  );
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const mealCount = selectedPlan?.mealCount ?? 0;

  const nextEligibleDate = useMemo(
    () => getNextEligibleDate(cutoffConfig),
    [cutoffConfig],
  );

  const deliveryWeekday = useMemo(
    () => getWeekday(nextEligibleDate),
    [nextEligibleDate],
  );

  // Not every dish is cooked every day — hard-filter to what's actually
  // available for the delivery date before anything else (category/search
  // filters operate on top of this, they never bring back an unavailable
  // dish). The server re-enforces this independently at order time.
  const dishesAvailableToday = useMemo(
    () => dishes.filter((d) => d.availableDays.includes(deliveryWeekday)),
    [dishes, deliveryWeekday],
  );

  const categories = useMemo(() => {
    const seen = new Set(dishesAvailableToday.map((d) => d.category));
    return Array.from(seen);
  }, [dishesAvailableToday]);

  const filteredDishes = dishesAvailableToday.filter((dish) => {
    const matchesCategory =
      categoryFilter === "all" || dish.category === categoryFilter;
    const matchesSearch =
      search.trim() === "" ||
      `${dish.name} ${dish.description}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const notEnoughDishesToday =
    selectedPlan !== null && dishesAvailableToday.length < mealCount;

  function selectPlan(planId: string) {
    setSelectedPlanId(planId);
    setSelectedDishIds([]); // changing tier resets the (now differently-sized) selection
  }

  function toggleDish(dishId: string) {
    setSelectedDishIds((current) => {
      if (current.includes(dishId)) {
        return current.filter((id) => id !== dishId);
      }
      if (current.length >= mealCount) return current; // bounded by the chosen tier
      return [...current, dishId];
    });
  }

  const hasContactDetails =
    contactName.trim() !== "" &&
    contactPhone.trim() !== "" &&
    contactEmail.trim() !== "" &&
    deliveryAddress.trim() !== "";

  const canCheckout =
    selectedPlan !== null &&
    selectedDishIds.length === mealCount &&
    hasContactDetails;

  async function handleCheckout() {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          dishIds: selectedDishIds,
          deliveryDate: nextEligibleDate,
          contactName,
          contactPhone,
          contactEmail,
          deliveryAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setSubmitError("Could not reach the server. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">1. Choose a plan</h2>
        <div className="flex flex-wrap gap-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => selectPlan(plan.id)}
              className={`rounded-lg border px-4 py-3 text-left transition ${
                plan.id === selectedPlanId
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 hover:border-neutral-500"
              }`}
            >
              <div className="font-medium">{plan.label}</div>
              <div className="text-sm opacity-80">{formatGbp(plan.priceGbp)}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">2. Pick your dishes</h2>
          <span className="text-sm text-neutral-600">
            {selectedDishIds.length} of {mealCount} selected
          </span>
        </div>
        <p className="text-sm text-neutral-600">
          Showing what&apos;s available for {WEEKDAY_LABELS[deliveryWeekday]}{" "}
          delivery ({nextEligibleDate}) — not every dish is made every day.
        </p>

        {notEnoughDishesToday && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
            Only {dishesAvailableToday.length} dish
            {dishesAvailableToday.length === 1 ? "" : "es"} available for{" "}
            {WEEKDAY_LABELS[deliveryWeekday]} delivery — not enough to fill{" "}
            {selectedPlan?.label}. Try a smaller plan, or check back for a
            different delivery day.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`rounded-full border px-3 py-1 text-sm ${
                categoryFilter === "all"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  categoryFilter === cat
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300"
                }`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto rounded-md border border-neutral-300 px-3 py-1 text-sm"
          />
        </div>

        {filteredDishes.length === 0 && (
          <p className="text-sm text-neutral-500">
            No dishes match — try a different category or search term.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredDishes.map((dish) => {
            const isSelected = selectedDishIds.includes(dish.id);
            const isDisabled =
              !isSelected && selectedDishIds.length >= mealCount;
            return (
              <button
                key={dish.id}
                type="button"
                disabled={isDisabled}
                onClick={() => toggleDish(dish.id)}
                className={`flex flex-col overflow-hidden rounded-lg border text-left transition ${
                  isSelected
                    ? "border-neutral-900 ring-2 ring-neutral-900"
                    : "border-neutral-200"
                } ${isDisabled ? "opacity-40" : "hover:border-neutral-400"}`}
              >
                <div className="relative h-36 w-full bg-neutral-100">
                  <Image
                    src={dish.imageUrl}
                    alt={dish.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <span className="font-medium">{dish.name}</span>
                  {dish.dietaryTag && (
                    <span className="text-xs text-neutral-500">
                      {dish.dietaryTag}
                    </span>
                  )}
                  <p className="text-sm text-neutral-600">{dish.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4">
        <h2 className="text-xl font-semibold">3. Delivery &amp; payment</h2>
        <p className="text-sm text-neutral-600">
          Next available delivery date:{" "}
          <span className="font-medium text-neutral-900">
            {nextEligibleDate}
          </span>{" "}
          (orders must be placed at least {cutoffConfig.leadDays} day
          {cutoffConfig.leadDays === 1 ? "" : "s"} ahead, by{" "}
          {cutoffConfig.cutoffTime} the day before). This date is re-checked
          when you pay — it can move on if you take a while to check out.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Phone
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Delivery address
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2"
              rows={2}
              required
            />
          </label>
        </div>

        {submitError && (
          <p className="text-sm text-red-600" role="alert">
            {submitError}
          </p>
        )}

        <button
          type="button"
          disabled={!canCheckout || isSubmitting}
          onClick={handleCheckout}
          className={`rounded-md px-4 py-2 font-medium text-white transition ${
            canCheckout && !isSubmitting
              ? "bg-neutral-900 hover:bg-neutral-700"
              : "cursor-not-allowed bg-neutral-300 text-neutral-600"
          }`}
        >
          {isSubmitting
            ? "Redirecting to payment…"
            : `Pay ${selectedPlan ? formatGbp(selectedPlan.priceGbp) : ""}`}
        </button>
      </section>
    </div>
  );
}
