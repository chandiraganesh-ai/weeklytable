import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";

const FEATURES = [
  {
    icon: "calendar_month",
    title: "Pick your own days",
    body: "Choose exactly which days of the week each meal arrives — no fixed schedule, no meals you don't want.",
  },
  {
    icon: "schedule",
    title: "A time slot, not a guess",
    body: "Tell us when you want each meal, and we'll have it on your doorstep within a guaranteed 1-hour window.",
  },
  {
    icon: "payments",
    title: "Pay your way",
    body: "Card online at checkout, or cash on delivery — whichever is easier for you.",
  },
  {
    icon: "block",
    title: "No subscriptions",
    body: "Order the weeks you want. Skip the ones you don't. There's no plan to cancel.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative flex min-h-[560px] items-center overflow-hidden sm:min-h-[640px]">
        <Image
          src="https://images.unsplash.com/photo-1542986151-13ecf8e0453e"
          alt="A flat lay of home-cooked dishes on a table"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/40 to-espresso/10"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-cream sm:py-32">
          <h1 className="max-w-xl font-serif text-4xl font-medium leading-tight sm:text-6xl">
            Home-cooked meals, delivered when you want them.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-cream/90">
            Choose your dishes, pick a day and time for each one, and pay
            however suits you. No subscription, no fixed menu — just a
            week&apos;s worth of good food, on your schedule.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/order"
              className="rounded-full bg-terracotta px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-terracotta-dark hover:shadow-md"
            >
              Order now
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-full border border-cream/40 px-6 py-3 text-base font-semibold text-cream transition hover:border-cream hover:bg-cream/10"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-light text-sage">
                <Icon name={feature.icon} className="text-[22px]" />
              </span>
              <h3 className="font-serif text-lg font-medium text-espresso">
                {feature.title}
              </h3>
              <p className="text-sm text-espresso/70">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-card-border bg-cream-dim/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">
              Our story
            </p>
            <h2 className="mt-2 font-serif text-3xl font-medium text-espresso sm:text-4xl">
              Cooked properly. Delivered honestly.
            </h2>
            <p className="mt-4 text-espresso/70">
              Weekly Table started with a simple frustration: takeaway gets
              old fast, and cooking every night isn&apos;t always realistic.
              We wanted meals that tasted home-cooked, arrived when we
              actually needed them, and didn&apos;t lock us into a
              subscription we&apos;d forget to cancel.
            </p>
            <p className="mt-4 text-espresso/70">
              So that&apos;s what we built: a small, changing menu of dishes
              cooked fresh, delivered to a day and time you choose, paid for
              however you like. No commitments — just a good meal, on your
              terms.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl border border-card-border bg-white p-6 shadow-sm">
              <p className="font-serif text-3xl font-medium text-terracotta">1hr</p>
              <p className="mt-1 text-sm text-espresso/70">
                Delivery guarantee window
              </p>
            </div>
            <div className="rounded-xl border border-card-border bg-white p-6 shadow-sm">
              <p className="font-serif text-3xl font-medium text-terracotta">0</p>
              <p className="mt-1 text-sm text-espresso/70">
                Subscriptions required
              </p>
            </div>
            <div className="rounded-xl border border-card-border bg-white p-6 shadow-sm">
              <p className="font-serif text-3xl font-medium text-terracotta">7</p>
              <p className="mt-1 text-sm text-espresso/70">
                Days of the week to choose from
              </p>
            </div>
            <div className="rounded-xl border border-card-border bg-white p-6 shadow-sm">
              <p className="font-serif text-3xl font-medium text-terracotta">2</p>
              <p className="mt-1 text-sm text-espresso/70">
                Ways to pay — card or cash
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
        <h2 className="font-serif text-3xl font-medium text-espresso sm:text-4xl">
          Ready to eat well this week?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-espresso/70">
          Browse the menu, build your week, and choose when it arrives.
        </p>
        <Link
          href="/order"
          className="mt-6 inline-block rounded-full bg-terracotta px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-terracotta-dark hover:shadow-md"
        >
          Order now
        </Link>
      </section>
    </>
  );
}
