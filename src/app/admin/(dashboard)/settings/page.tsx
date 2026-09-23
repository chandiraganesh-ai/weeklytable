import { prisma } from "@/lib/prisma";
import { updateCutoffConfig } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const config = await prisma.cutoffConfig.findUniqueOrThrow({
    where: { id: "default" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Order cutoff settings</h1>
      <p className="max-w-md text-sm text-neutral-600">
        Orders for a given delivery date must be placed at least this many
        days ahead, by this time of day (in the given timezone) on the day
        before the cutoff window closes.
      </p>

      <form action={updateCutoffConfig} className="flex max-w-xs flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Lead days
          <input
            type="number"
            name="leadDays"
            min={1}
            defaultValue={config.leadDays}
            className="rounded-md border border-neutral-300 px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Cutoff time (24h)
          <input
            type="time"
            name="cutoffTime"
            defaultValue={config.cutoffTime}
            className="rounded-md border border-neutral-300 px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Timezone
          <input
            type="text"
            name="timezone"
            defaultValue={config.timezone}
            className="rounded-md border border-neutral-300 px-3 py-2"
            required
          />
        </label>
        <button
          type="submit"
          className="mt-2 w-fit rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Save
        </button>
      </form>
    </div>
  );
}
