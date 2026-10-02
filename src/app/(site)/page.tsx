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
          src="https://images.unsplash.com/photo-1696935257293-9ec4f03074a1"
          alt="A golden-topped homemade shepherd's pie fresh from the oven"
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
            Homemade food, made with care.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-cream/90">
            Good food should be fresh, nourishing, affordable and enjoyable —
            without the shopping, cooking and washing up. Choose your dishes,
            pick a day and time for each one, and we&apos;ll bring it to your
            door hot, across Southend-on-Sea, 7 days a week.
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
              About Weekly Table
            </p>
            <h2 className="mt-2 font-serif text-3xl font-medium text-espresso sm:text-4xl">
              Food that feels like it was made at home.
            </h2>
            <p className="mt-4 text-espresso/70">
              Born from our experience creating and serving food through The
              Burrito and Tasty Bowls-Globowl, Weekly Table brings together
              the things we love most about food: quality ingredients,
              generous portions, exciting flavours and, above all, food that
              feels like it has been made at home.
            </p>
            <p className="mt-4 text-espresso/70">
              Our menu brings together proper British homemade favourites —
              Cottage Pie, Shepherd&apos;s Pie, Roast Chicken, Fish &amp;
              Chips, Steak &amp; Onion Pie, Sausage &amp; Mash — alongside
              Italian, Mexican, Indian and Asian-inspired dishes, healthy
              bowls and salads, and other world favourites. Whether you fancy
              a traditional homemade dinner or something a little different,
              there&apos;s plenty of choice while keeping the comfort and
              quality of a freshly prepared meal.
            </p>
            <p className="mt-4 text-espresso/70">
              We prepare every meal with care and deliver it hot to your door
              across Southend-on-Sea, 7 days a week — with options for
              vegetarian, vegan and gluten-free diets, so there&apos;s
              something for everyone at the table.
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
              <p className="font-serif text-3xl font-medium text-terracotta">7</p>
              <p className="mt-1 text-sm text-espresso/70">
                Days a week we deliver
              </p>
            </div>
            <div className="rounded-xl border border-card-border bg-white p-6 shadow-sm">
              <p className="font-serif text-3xl font-medium text-terracotta">3</p>
              <p className="mt-1 text-sm text-espresso/70">
                Diets catered for — veggie, vegan &amp; gluten-free
              </p>
            </div>
            <div className="rounded-xl border border-card-border bg-white p-6 shadow-sm">
              <p className="font-serif text-3xl font-medium text-terracotta">0</p>
              <p className="mt-1 text-sm text-espresso/70">
                Subscriptions required
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
        <h2 className="font-serif text-3xl font-medium text-espresso sm:text-4xl">
          Good food. More time for you.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-espresso/70">
          No shopping. No cooking. No cleaning. Just fresh, tasty homemade
          food delivered to your door.
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
