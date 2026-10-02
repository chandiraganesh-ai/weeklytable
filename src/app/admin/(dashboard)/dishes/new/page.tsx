import DishForm from "@/components/admin/DishForm";
import { requireRole } from "@/lib/dal";
import { createDish } from "../actions";

export default async function NewDishPage() {
  await requireRole(["owner"]);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Add a dish</h1>
      <DishForm action={createDish} submitLabel="Create dish" />
    </div>
  );
}
