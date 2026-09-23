import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Safe to expose without auth: keyed by a Stripe Checkout session id, which
// is an unguessable token only the customer who just paid would have.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  const order = await prisma.order.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
    select: {
      id: true,
      status: true,
      planLabelSnapshot: true,
      planPriceGbpSnapshot: true,
      contactName: true,
      contactEmail: true,
      deliveryAddress: true,
      items: {
        select: { dishNameSnapshot: true, deliveryDate: true },
        orderBy: { deliveryDate: "asc" },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    planLabel: order.planLabelSnapshot,
    priceGbp: order.planPriceGbpSnapshot,
    contactName: order.contactName,
    contactEmail: order.contactEmail,
    deliveryAddress: order.deliveryAddress,
    meals: order.items.map((i) => ({
      dishName: i.dishNameSnapshot,
      deliveryDate: i.deliveryDate.toISOString().slice(0, 10),
    })),
  });
}
