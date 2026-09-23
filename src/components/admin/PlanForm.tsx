type PlanFormValues = {
  label: string;
  mealCount: number;
  priceGbp: number;
  sortOrder: number;
  isActive: boolean;
};

export default function PlanForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: PlanFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex max-w-md flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Label
        <input
          type="text"
          name="label"
          defaultValue={initial?.label}
          placeholder="e.g. 3 Meals a Week"
          className="rounded-md border border-neutral-300 px-3 py-2"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Meal count
        <input
          type="number"
          name="mealCount"
          min={1}
          defaultValue={initial?.mealCount}
          className="rounded-md border border-neutral-300 px-3 py-2"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Price (£)
        <input
          type="number"
          name="priceGbp"
          step="0.01"
          min={0}
          defaultValue={
            initial ? (initial.priceGbp / 100).toFixed(2) : undefined
          }
          className="rounded-md border border-neutral-300 px-3 py-2"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Sort order
        <input
          type="number"
          name="sortOrder"
          defaultValue={initial?.sortOrder ?? 0}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={initial?.isActive ?? true}
        />
        Active (shown to customers)
      </label>
      <button
        type="submit"
        className="mt-2 w-fit rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
