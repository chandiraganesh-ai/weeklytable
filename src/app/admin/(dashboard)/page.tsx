import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/dal";

export default async function AdminHomePage() {
  const session = await requireAdminSession();
  redirect(
    session.role === "delivery" ? "/admin/orders/upcoming" : "/admin/orders",
  );
}
