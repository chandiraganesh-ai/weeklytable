"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  getEligibleWindow,
  getWeekday,
  type CutoffConfigLike,
  type WeekdayName,
} from "@/lib/cutoff";
import { CATEGORY_LABELS, DIETARY_TAG_LABELS } from "@/lib/dishOptions";
import type { Category, DietaryTag } from "@/generated/prisma/enums";
import { Icon } from "@/components/Icon";

export type DishView = {
  id: string;
  name: string;
  category: Category;
  dietaryTag: DietaryTag | null;
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

function formatGbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatDayTab(date: string) {
  const [, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAY_SHORT[getWeekday(date)];
  return `${weekday} ${day}/${month}`;
}

// The "1 / 2 / 3" section markers double as progress feedback — once a
// step is satisfied its badge fills sage with a checkmark instead of the
// terracotta number, echoing the step-breadcrumb in the original design.
function StepBadge({ number, done }: { number: number; done: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full font-sans text-sm font-semibold text-white transition-colors ${
        done ? "bg-sage" : "bg-terracotta"
      }`}
    >
      {done ? <Icon name="check" className="text-[16px] leading-none" /> : number}
    </span>
  );
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
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
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
    <div className="mx-auto flex max-w-6xl flex-col gap-10 bg-cream p-6 font-sans text-espresso antialiased sm:p-8">
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-espresso">
          <StepBadge number={1} done={selectedPlan !== null} />
          Choose a plan
        </h2>
        <div className="flex flex-wrap gap-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => selectPlan(plan.id)}
              className={`rounded-xl border px-5 py-4 text-left shadow-sm transition active:scale-[0.98] ${
                plan.id === selectedPlanId
                  ? "border-terracotta bg-terracotta text-white shadow-md"
                  : "border-card-border bg-white hover:-translate-y-0.5 hover:border-terracotta/50 hover:shadow-md"
              }`}
            >
              <div className="font-serif text-lg font-medium">{plan.label}</div>
              <div
                className={`text-sm ${
                  plan.id === selectedPlanId ? "text-white/90" : "text-espresso/70"
                }`}
              >
                {formatGbp(plan.priceGbp)}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-espresso">
            <StepBadge number={2} done={mealCount > 0 && selectedMeals.length === mealCount} />
            Pick a meal for each day
          </h2>
          <span className="text-sm text-espresso/60">
            {selectedMeals.length} of {mealCount} selected
          </span>
        </div>
        <p className="text-sm text-espresso/70">
          Choose which day each meal is delivered — not every dish is made
          every day, so the menu below changes as you switch days.
        </p>

        {selectedMeals.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-xl border border-card-border bg-cream-dim/60 p-4 text-sm">
            {selectedMeals.map((meal, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span>
                  <span className="font-medium text-terracotta">{meal.date}</span>{" "}
                  — {dishName(meal.dishId)}
                </span>
                <button
                  type="button"
                  onClick={() => removeMeal(i)}
                  className="text-espresso/50 hover:text-terracotta"
                  aria-label={`Remove ${dishName(meal.dishId)} on ${meal.date}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2 border-b border-card-border pb-4">
          {eligibleDates.map((date) => {
            const count = selectedMeals.filter((m) => m.date === date).length;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setActiveDate(date)}
                className={`relative rounded-full border px-3 py-1.5 text-sm transition active:scale-95 ${
                  date === activeDate
                    ? "border-terracotta bg-terracotta text-white shadow-sm"
                    : "border-card-border bg-white text-espresso hover:border-terracotta/50"
                }`}
              >
                {formatDayTab(date)}
                {count > 0 && (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 text-xs ${
                      date === activeDate ? "bg-white/25" : "bg-terracotta/10 text-terracotta"
                    }`}
                  >
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
              className={`rounded-full border px-3 py-1 text-sm transition active:scale-95 ${
                categoryFilter === "all"
                  ? "border-sage bg-sage text-white"
                  : "border-card-border bg-white text-espresso hover:border-sage/50"
              }`}
            >
              All
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
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto rounded-full border border-card-border bg-white px-4 py-1.5 text-sm text-espresso placeholder:text-espresso/40 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          />
        </div>

        {filteredDishes.length === 0 && (
          <p className="flex items-center gap-2 rounded-xl border border-card-border bg-cream-dim/60 px-4 py-3 text-sm text-espresso/60">
            <Icon name="search_off" className="shrink-0 text-[20px] text-espresso/40" />
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
                className={`relative flex flex-col overflow-hidden rounded-xl border bg-white text-left shadow-sm transition active:scale-[0.98] ${
                  isSelected
                    ? "border-terracotta shadow-md ring-2 ring-terracotta"
                    : "border-card-border"
                } ${isDisabled ? "opacity-40" : "hover:-translate-y-0.5 hover:border-terracotta/40 hover:shadow-md"}`}
              >
                {isSelected && (
                  <span className="absolute right-2 top-2 z-10 flex h-6 w-6 scale-100 items-center justify-center rounded-full bg-terracotta text-white shadow-sm transition-transform">
                    <Icon name="check" className="text-[16px] leading-none" />
                  </span>
                )}
                <div className="relative h-40 w-full bg-cream-dim">
                  <Image
                    src={dish.imageUrl}
                    alt={dish.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <span className="font-serif text-lg font-medium text-espresso">
                    {dish.name}
                  </span>
                  {dish.dietaryTag && (
                    <span className="inline-block w-fit rounded-full bg-sage/10 px-2 py-0.5 text-xs font-medium text-sage">
                      {DIETARY_TAG_LABELS[dish.dietaryTag]}
                    </span>
                  )}
                  <p className="text-sm text-espresso/70">{dish.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-card-border bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-espresso">
          <StepBadge number={3} done={canCheckout} />
          Delivery &amp; payment
        </h2>
        <p className="flex items-start gap-1.5 text-sm text-espresso/70">
          <Icon name="schedule" className="mt-0.5 shrink-0 text-[18px] text-terracotta" />
          <span>
            Orders must be placed at least {cutoffConfig.leadDays} day
            {cutoffConfig.leadDays === 1 ? "" : "s"} ahead, by{" "}
            {cutoffConfig.cutoffTime} the day before each delivery date. Dates
            are re-checked when you pay — they can become unavailable if you
            take a while to check out.
          </span>
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-espresso">
            Name
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="rounded-lg border border-card-border bg-cream-dim px-3 py-2 text-espresso focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-espresso">
            Phone
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="rounded-lg border border-card-border bg-cream-dim px-3 py-2 text-espresso focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-espresso">
            Email
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="rounded-lg border border-card-border bg-cream-dim px-3 py-2 text-espresso focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-espresso sm:col-span-2">
            Delivery address
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="rounded-lg border border-card-border bg-cream-dim px-3 py-2 text-espresso focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              rows={2}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-espresso sm:col-span-2">
            Notes / dietary restrictions (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-lg border border-card-border bg-cream-dim px-3 py-2 text-espresso focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
              rows={2}
              maxLength={1000}
              placeholder="e.g. nut allergy, no dairy, leave at the door…"
            />
          </label>
          <div className="flex flex-col gap-2 text-sm sm:col-span-2">
            <span className="font-medium text-espresso">Payment method</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label
                className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition ${
                  paymentMethod === "stripe"
                    ? "border-terracotta bg-terracotta/5"
                    : "border-card-border bg-white hover:border-terracotta/40"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "stripe"}
                  onChange={() => setPaymentMethod("stripe")}
                  className="accent-terracotta"
                />
                <Icon name="credit_card" className="text-[18px] text-terracotta" />
                Pay by card now
              </label>
              <label
                className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition ${
                  paymentMethod === "cash"
                    ? "border-terracotta bg-terracotta/5"
                    : "border-card-border bg-white hover:border-terracotta/40"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="accent-terracotta"
                />
                <Icon name="payments" className="text-[18px] text-terracotta" />
                Cash on delivery
              </label>
            </div>
          </div>
        </div>

        {submitError && (
          <p
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            <Icon name="error" className="shrink-0 text-[18px]" />
            {submitError}
          </p>
        )}

        <button
          type="button"
          disabled={!canCheckout || isSubmitting}
          onClick={handleCheckout}
          className={`flex w-fit items-center gap-2 rounded-full px-6 py-3 font-semibold text-white shadow-md transition active:scale-[0.98] ${
            canCheckout && !isSubmitting
              ? "bg-terracotta hover:bg-terracotta-dark hover:shadow-lg"
              : "cursor-not-allowed bg-card-border text-espresso/40 shadow-none"
          }`}
        >
          <Icon name="lock" className="text-[18px]" />
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
