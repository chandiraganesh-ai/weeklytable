// Client-side, advisory-only calculation of the next eligible delivery date.
// The server is always the authority on this — see the order-creation route
// in a later phase, which re-validates independently of anything computed here.

export type CutoffConfigLike = {
  leadDays: number;
  cutoffTime: string; // "HH:MM", 24h
  timezone: string;
};

function partsInTimezone(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function addDays(year: number, month: number, day: number, days: number) {
  // UTC-anchored date math avoids DST edge cases when only whole days matter.
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

function formatDateISO(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Returns the earliest eligible delivery date as an "YYYY-MM-DD" string. */
export function getNextEligibleDate(
  config: CutoffConfigLike,
  now: Date = new Date(),
): string {
  const { year, month, day, hour, minute } = partsInTimezone(
    now,
    config.timezone,
  );
  const [cutoffHour, cutoffMinute] = config.cutoffTime.split(":").map(Number);

  const nowMinutes = hour * 60 + minute;
  const cutoffMinutes = cutoffHour * 60 + cutoffMinute;

  // Past cutoff today -> today no longer counts as a valid "D - leadDays" day.
  const extraDay = nowMinutes >= cutoffMinutes ? 1 : 0;

  const eligible = addDays(year, month, day, config.leadDays + extraDay);
  return formatDateISO(eligible.year, eligible.month, eligible.day);
}
