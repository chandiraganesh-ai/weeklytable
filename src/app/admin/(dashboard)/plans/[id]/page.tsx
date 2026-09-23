import { notFound } from "next/navigation";
import PlanForm from "@/components/admin/PlanForm";
import { prisma } from "@/lib/prisma";
import { updatePlan } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) notFound();

  const boundUpdatePlan = updatePlan.bind(null, plan.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Edit plan</h1>
      <PlanForm action={boundUpdatePlan} initial={plan} submitLabel="Save changes" />
    </div>
  );
}
