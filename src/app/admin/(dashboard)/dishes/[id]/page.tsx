import { notFound } from "next/navigation";
import DishForm from "@/components/admin/DishForm";
import { prisma } from "@/lib/prisma";
import { updateDish } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditDishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish) notFound();

  const boundUpdateDish = updateDish.bind(null, dish.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Edit dish</h1>
      <DishForm action={boundUpdateDish} initial={dish} submitLabel="Save changes" />
    </div>
  );
}
