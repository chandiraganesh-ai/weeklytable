// Isomorphic delivery-time-slot math: generates the selectable delivery
// time slots for a day and validates a requested slot server-side.
//
// Deliberately kept separate from src/lib/cutoff.ts — that file gates
// which DATES are orderable (when an order must be placed by); this file
// governs what TIME of day a meal can be requested for. Different concern,
// different config fields, never mix them up.

export type DeliveryWindowConfigLike = {
  deliveryWindowStart: string; // "HH:MM", 24h
  deliveryWindowEnd: string; // "HH:MM", 24h
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const SLOT_MINUTES = 30;

// The business's guarantee: food arrives within this many minutes of the
// requested time. A fixed policy, not currently admin-configurable.
export const DELIVERY_GUARANTEE_MINUTES = 60;

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function toTimeString(minutes: number): string {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Every selectable delivery time slot ("HH:MM"), inclusive of both ends
 * of the configured window, in 30-minute increments. */
export function getDeliveryTimeSlots(
  config: DeliveryWindowConfigLike,
): string[] {
  const start = toMinutes(config.deliveryWindowStart);
  const end = toMinutes(config.deliveryWindowEnd);
  const slots: string[] = [];
  for (let minutes = start; minutes <= end; minutes += SLOT_MINUTES) {
    slots.push(toTimeString(minutes));
  }
  return slots;
}

/** Authoritative check: is `time` ("HH:MM") a valid, in-window delivery
 * slot? Never trust a client-supplied time without this. */
export function isDeliveryTimeValid(
  time: string,
  config: DeliveryWindowConfigLike,
): boolean {
  if (!TIME_RE.test(time)) return false;
  return getDeliveryTimeSlots(config).includes(time);
}

/** "16:00" -> "4:00 PM" — used for slot picker labels and per-meal display. */
export function formatTime12h(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

/** Human-readable guaranteed delivery window, e.g. "4:15 PM – 5:15 PM". */
export function formatGuaranteeWindow(time: string): string {
  const end = toMinutes(time) + DELIVERY_GUARANTEE_MINUTES;
  return `${formatTime12h(time)} – ${formatTime12h(toTimeString(end))}`;
}
