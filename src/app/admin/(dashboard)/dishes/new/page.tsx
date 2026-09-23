import DishForm from "@/components/admin/DishForm";
import { createDish } from "../actions";

export default function NewDishPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Add a dish</h1>
      <DishForm action={createDish} submitLabel="Create dish" />
    </div>
  );
}
