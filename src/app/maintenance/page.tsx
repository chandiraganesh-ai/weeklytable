import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/contact";

// Standalone — deliberately outside the (site) route group so it never
// renders nav links into pages that proxy.ts is actively gating.
export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center font-sans text-espresso antialiased">
      <p className="font-serif text-lg font-medium text-terracotta">Weekly Table</p>
      <h1 className="mt-3 font-serif text-3xl font-medium text-espresso sm:text-4xl">
        We&apos;re putting the finishing touches on something.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-espresso/85">
        We&apos;ll be back shortly. For anything urgent, call us on{" "}
        <a
          href={SUPPORT_PHONE_TEL}
          className="whitespace-nowrap font-semibold text-terracotta hover:text-terracotta-dark"
        >
          {SUPPORT_PHONE_DISPLAY}
        </a>
        .
      </p>
    </div>
  );
}
