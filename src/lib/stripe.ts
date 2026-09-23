import Stripe from "stripe";

// No apiVersion pinned here — the installed SDK's own bundled default is
// used, avoiding a hand-typed version string going stale on SDK upgrades.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
