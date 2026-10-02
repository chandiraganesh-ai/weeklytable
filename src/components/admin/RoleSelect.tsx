"use client";

export default function RoleSelect({
  name,
  roles,
  defaultValue,
}: {
  name: string;
  roles: readonly string[];
  defaultValue: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="rounded-md border border-neutral-300 px-2 py-1"
    >
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
