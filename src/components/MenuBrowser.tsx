"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  getEligibleWindow,
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

export type PlanView = {
  id: string;
  label: string;
  mealCount: number;
  priceGbp: number;
};

type SelectedMeal = { dishId: string; date: string };

const WEEKDAY_SHORT: Record<WeekdayName, string> = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
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

function formatDayTab(date: string) {
  const [, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAY_SHORT[getWeekday(date)];
  return `${weekday} ${day}/${month}`;
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
  const eligibleDates = useMemo(
    () => getEligibleWindow(cutoffConfig),
    [cutoffConfig],
  );

  const [activeDate, setActiveDate] = useState(eligibleDates[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    plans[0]?.id ?? null,
  );
  const [selectedMeals, setSelectedMeals] = useState<SelectedMeal[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cash">("stripe");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const mealCount = selectedPlan?.mealCount ?? 0;

  const activeWeekday = getWeekday(activeDate);

  // Not every dish is cooked every day — hard-filter to what's actually
  // available on the active day before anything else (category/search
  // filters operate on top of this). The server re-enforces this
  // independently, per meal, at order time.
  const dishesForActiveDay = useMemo(
    () => dishes.filter((d) => d.availableDays.includes(activeWeekday)),
    [dishes, activeWeekday],
  );

  const categories = useMemo(() => {
    const seen = new Set(dishesForActiveDay.map((d) => d.category));
    return Array.from(seen);
  }, [dishesForActiveDay]);

  const filteredDishes = dishesForActiveDay.filter((dish) => {
    const matchesCategory =
      categoryFilter === "all" || dish.category === categoryFilter;
    const matchesSearch =
      search.trim() === "" ||
      `${dish.name} ${dish.description}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function selectPlan(planId: string) {
    setSelectedPlanId(planId);
    setSelectedMeals([]); // changing tier resets the (now differently-sized) selection
  }

  function toggleMeal(dishId: string, date: string) {
    setSelectedMeals((current) => {
      const exists = current.some((m) => m.dishId === dishId && m.date === date);
      if (exists) {
        return current.filter((m) => !(m.dishId === dishId && m.date === date));
      }
      if (current.length >= mealCount) return current; // bounded by the chosen tier
      return [...current, { dishId, date }];
    });
  }

  function removeMeal(index: number) {
    setSelectedMeals((current) => current.filter((_, i) => i !== index));
  }

  function dishName(dishId: string) {
    return dishes.find((d) => d.id === dishId)?.name ?? dishId;
  }

  const hasContactDetails =
    contactName.trim() !== "" &&
    contactPhone.trim() !== "" &&
    contactEmail.trim() !== "" &&
    deliveryAddress.trim() !== "";

  const canCheckout =
    selectedPlan !== null &&
    selectedMeals.length === mealCount &&
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
          items: selectedMeals.map((m) => ({
            dishId: m.dishId,
            deliveryDate: m.date,
          })),
          contactName,
          contactPhone,
          contactEmail,
          deliveryAddress,
          notes: notes.trim() === "" ? undefined : notes.trim(),
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Cash order — no Stripe redirect. Reuse the same confirmation
        // page by passing the order's own id in place of a Stripe
        // session id (the by-session route accepts either for cash
        // orders — see its comment for why that's safe).
        window.location.href = `/order-confirmed?session_id=${encodeURIComponent(data.orderId)}`;
      }
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
          <h2 className="text-xl font-semibold">2. Pick a meal for each day</h2>
          <span className="text-sm text-neutral-600">
            {selectedMeals.length} of {mealCount} selected
          </span>
        </div>
        <p className="text-sm text-neutral-600">
          Choose which day each meal is delivered — not every dish is made
          every day, so the menu below changes as you switch days.
        </p>

        {selectedMeals.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-md bg-neutral-50 p-3 text-sm">
            {selectedMeals.map((meal, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span>
                  <span className="font-medium">{meal.date}</span> —{" "}
                  {dishName(meal.dishId)}
                </span>
                <button
                  type="button"
                  onClick={() => removeMeal(i)}
                  className="text-neutral-500 hover:text-neutral-900"
                  aria-label={`Remove ${dishName(meal.dishId)} on ${meal.date}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
          {eligibleDates.map((date) => {
            const count = selectedMeals.filter((m) => m.date === date).length;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setActiveDate(date)}
                className={`relative rounded-full border px-3 py-1.5 text-sm ${
                  date === activeDate
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300"
                }`}
              >
                {formatDayTab(date)}
                {count > 0 && (
                  <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-xs">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

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
            Nothing matches for this day — try a different category, search
            term, or day tab above.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredDishes.map((dish) => {
            const isSelected = selectedMeals.some(
              (m) => m.dishId === dish.id && m.date === activeDate,
            );
            const isDisabled =
              !isSelected && selectedMeals.length >= mealCount;
            return (
              <button
                key={dish.id}
                type="button"
                disabled={isDisabled}
                onClick={() => toggleMeal(dish.id, activeDate)}
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
          Orders must be placed at least {cutoffConfig.leadDays} day
          {cutoffConfig.leadDays === 1 ? "" : "s"} ahead, by{" "}
          {cutoffConfig.cutoffTime} the day before each delivery date. Dates
          are re-checked when you pay — they can become unavailable if you
          take a while to check out.
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
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Notes / dietary restrictions (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2"
              rows={2}
              maxLength={1000}
              placeholder="e.g. nut allergy, no dairy, leave at the door…"
            />
          </label>
          <div className="flex flex-col gap-2 text-sm sm:col-span-2">
            <span className="font-medium">Payment method</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "stripe"}
                  onChange={() => setPaymentMethod("stripe")}
                />
                Pay by card now
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
                Cash on delivery
              </label>
            </div>
          </div>
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
            ? paymentMethod === "cash"
              ? "Placing order…"
              : "Redirecting to payment…"
            : paymentMethod === "cash"
              ? `Place order — pay ${selectedPlan ? formatGbp(selectedPlan.priceGbp) : ""} cash on delivery`
              : `Pay ${selectedPlan ? formatGbp(selectedPlan.priceGbp) : ""}`}
        </button>
      </section>
    </div>
  );
}
