import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { AdminRole } from "@/generated/prisma/enums";
import RoleSelect from "@/components/admin/RoleSelect";
import {
  createAdminUser,
  setAdminUserActive,
  updateAdminUserRole,
} from "./actions";

export const dynamic = "force-dynamic";

const ROLES = Object.values(AdminRole);

export default async function AdminUsersPage() {
  const session = await requireRole(["owner"]);
  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Admin users</h1>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Role</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Created</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id} className="border-b border-neutral-100">
              <td className="py-2 pr-4">
                {admin.email}
                {admin.id === session.adminId && (
                  <span className="ml-1 text-xs text-neutral-400">(you)</span>
                )}
              </td>
              <td className="py-2 pr-4">
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await updateAdminUserRole(
                      admin.id,
                      String(formData.get("role")),
                    );
                  }}
                >
                  <RoleSelect name="role" roles={ROLES} defaultValue={admin.role} />
                </form>
              </td>
              <td className="py-2 pr-4">
                {admin.isActive ? (
                  <span className="text-green-700">Active</span>
                ) : (
                  <span className="text-neutral-400">Deactivated</span>
                )}
              </td>
              <td className="py-2 pr-4">
                {admin.createdAt.toISOString().slice(0, 10)}
              </td>
              <td className="py-2 pr-4">
                {admin.id !== session.adminId && (
                  <form
                    action={async () => {
                      "use server";
                      await setAdminUserActive(admin.id, !admin.isActive);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700"
                    >
                      {admin.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4">
        <h2 className="font-medium">Create admin user</h2>
        <form
          action={createAdminUser}
          className="flex flex-wrap items-end gap-3"
        >
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-md border border-neutral-300 px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Password
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="rounded-md border border-neutral-300 px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Role
            <select
              name="role"
              defaultValue="kitchen"
              className="rounded-md border border-neutral-300 px-2 py-1"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            Create
          </button>
        </form>
      </section>
    </div>
  );
}
