type DishFormValues = {
  name: string;
  category: string;
  dietaryTag: string | null;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

export default function DishForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: DishFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex max-w-lg flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          type="text"
          name="name"
          defaultValue={initial?.name}
          className="rounded-md border border-neutral-300 px-3 py-2"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Category
        <input
          type="text"
          name="category"
          defaultValue={initial?.category}
          placeholder="e.g. classics"
          className="rounded-md border border-neutral-300 px-3 py-2"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Dietary tag (optional)
        <input
          type="text"
          name="dietaryTag"
          defaultValue={initial?.dietaryTag ?? ""}
          placeholder="e.g. vegetarian"
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={3}
          className="rounded-md border border-neutral-300 px-3 py-2"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Image URL
        <input
          type="text"
          name="imageUrl"
          defaultValue={initial?.imageUrl}
          placeholder="/dishes/placeholder.svg"
          className="rounded-md border border-neutral-300 px-3 py-2"
          required
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={initial?.isActive ?? true}
        />
        Active (visible on the menu)
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
