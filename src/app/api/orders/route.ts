import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { isDeliveryDateEligible, getWeekday } from "@/lib/cutoff";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

type OrderItemInput = { dishId: string; deliveryDate: string };

function parseItems(value: unknown): OrderItemInput[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const items: OrderItemInput[] = [];
  for (const raw of value) {
    if (
      typeof raw !== "object" ||
      raw === null ||
      typeof (raw as Record<string, unknown>).dishId !== "string" ||
      typeof (raw as Record<string, unknown>).deliveryDate !== "string"
    ) {
      return null;
    }
    items.push({
      dishId: (raw as Record<string, unknown>).dishId as string,
      deliveryDate: (raw as Record<string, unknown>).deliveryDate as string,
    });
  }
  return items;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  if (typeof body !== "object" || body === null) {
    return badRequest("Invalid request body.");
  }

  const { planId, items: rawItems, contactName, contactPhone, contactEmail, deliveryAddress } =
    body as Record<string, unknown>;

  if (typeof planId !== "string" || planId.trim() === "") {
    return badRequest("planId is required.");
  }
  const items = parseItems(rawItems);
  if (!items) {
    return badRequest(
      "items must be a non-empty array of { dishId, deliveryDate }.",
    );
  }
  if (!items.every((item) => DATE_RE.test(item.deliveryDate))) {
    return badRequest("Each item's deliveryDate must be in YYYY-MM-DD format.");
  }
  if (typeof contactName !== "string" || contactName.trim() === "") {
    return badRequest("contactName is required.");
  }
  if (typeof contactPhone !== "string" || contactPhone.trim() === "") {
    return badRequest("contactPhone is required.");
  }
  if (typeof contactEmail !== "string" || !EMAIL_RE.test(contactEmail)) {
    return badRequest("contactEmail must be a valid email address.");
  }
  if (typeof deliveryAddress !== "string" || deliveryAddress.trim() === "") {
    return badRequest("deliveryAddress is required.");
  }

  // --- Authoritative server-side checks. Nothing above this line is trusted. ---

  const cutoffConfig = await prisma.cutoffConfig.findUniqueOrThrow({
    where: { id: "default" },
  });
  const ineligibleDates = Array.from(
    new Set(items.map((i) => i.deliveryDate)),
  ).filter((date) => !isDeliveryDateEligible(date, cutoffConfig));
  if (ineligibleDates.length > 0) {
    return badRequest(
      "One or more selected delivery dates are no longer available — please refresh and choose again.",
    );
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    return badRequest("That plan is no longer available.");
  }
  if (items.length !== plan.mealCount) {
    return badRequest(
      `${plan.label} requires exactly ${plan.mealCount} meal${plan.mealCount === 1 ? "" : "s"}.`,
    );
  }

  const uniqueDishIds = Array.from(new Set(items.map((i) => i.dishId)));
  const activeDishes = await prisma.dish.findMany({
    where: { id: { in: uniqueDishIds }, isActive: true },
    select: { id: true, name: true, availableDays: true },
  });
  const dishById = new Map(activeDishes.map((d) => [d.id, d]));
  if (activeDishes.length !== uniqueDishIds.length) {
    return badRequest("One or more selected dishes are no longer available.");
  }

  // Not every dish is made every day — re-check each item's own date
  // independently of whatever the client filtered client-side.
  const mismatched = items.filter((item) => {
    const dish = dishById.get(item.dishId)!;
    return !dish.availableDays.includes(getWeekday(item.deliveryDate));
  });
  if (mismatched.length > 0) {
    const names = Array.from(
      new Set(mismatched.map((i) => dishById.get(i.dishId)!.name)),
    );
    return badRequest(
      `${names.join(", ")} ${names.length === 1 ? "is" : "are"} not available for delivery on the selected day — please refresh and choose again.`,
    );
  }

  // --- Everything validated — create the Stripe Checkout Session first, so
  // we never write an Order row that doesn't correspond to a real session. ---

  const orderId = randomUUID();
  const origin = req.nextUrl.origin;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: plan.priceGbp,
            product_data: { name: plan.label },
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId,
        mealCount: String(items.length),
      },
      customer_email: contactEmail,
      success_url: `${origin}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });
  } catch (err) {
    console.error("Stripe Checkout session creation failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 },
    );
  }

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 },
    );
  }

  await prisma.order.create({
    data: {
      id: orderId,
      planId: plan.id,
      planLabelSnapshot: plan.label,
      planPriceGbpSnapshot: plan.priceGbp,
      contactName,
      contactPhone,
      contactEmail,
      deliveryAddress,
      status: "pending_payment",
      stripeCheckoutSessionId: session.id,
      items: {
        create: items.map((item) => ({
          dishId: item.dishId,
          dishNameSnapshot: dishById.get(item.dishId)!.name,
          deliveryDate: new Date(`${item.deliveryDate}T00:00:00.000Z`),
        })),
      },
    },
  });

  return NextResponse.json({ checkoutUrl: session.url });
}
