import PlanForm from "@/components/admin/PlanForm";
import { requireRole } from "@/lib/dal";
import { createPlan } from "../actions";

export default async function NewPlanPage() {
  await requireRole(["owner"]);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Add a plan</h1>
      <PlanForm action={createPlan} submitLabel="Create plan" />
    </div>
  );
}
