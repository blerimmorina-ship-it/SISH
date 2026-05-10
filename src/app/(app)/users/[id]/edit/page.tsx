import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { UserForm, type UserInitialValues } from "../../user-form";
import type { Role } from "@/lib/rbac";

export const metadata = { title: "Edito përdoruesin" };
export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();
  if (!hasPermission(session?.role, "USERS_MANAGE")) redirect("/dashboard");

  const db = await getDb();
  const { id } = await params;
  const [user, departments] = await Promise.all([
    db.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        departmentId: true,
        twoFactorEnabled: true,
        isActive: true,
      },
    }),
    db.department.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!user) notFound();

  const initialUser: UserInitialValues = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role as Role,
    departmentId: user.departmentId,
    twoFactorEnabled: user.twoFactorEnabled,
    isActive: user.isActive,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edito ${user.firstName} ${user.lastName}`}
        description={user.email}
        breadcrumb={[
          { label: "Administrimi" },
          { label: "Përdoruesit", href: "/users" },
          { label: "Edito" },
        ]}
      />
      <UserForm
        departments={departments.map((d) => ({ id: d.id, name: d.nameSq }))}
        initialUser={initialUser}
      />
    </div>
  );
}
