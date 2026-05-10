import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db-context";
import { getCurrentSession, hasPermission } from "@/lib/auth";
import { UserForm } from "../user-form";

export const metadata = { title: "Përdorues i ri" };
export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!hasPermission(session?.role, "USERS_MANAGE")) redirect("/dashboard");

  const departments = await db.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Përdorues i ri"
        description="Krijo llogari për anëtar të stafit me rolin dhe departamentin përkatës"
        breadcrumb={[
          { label: "Administrimi" },
          { label: "Përdoruesit", href: "/users" },
          { label: "I ri" },
        ]}
      />
      <UserForm departments={departments.map((d) => ({ id: d.id, name: d.nameSq }))} />
    </div>
  );
}
