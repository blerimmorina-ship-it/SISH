import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db-context";
import { VisitForm } from "../visit-form";

export const metadata = { title: "Vizitë e re" };
export const dynamic = "force-dynamic";

export default async function NewVisitPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const db = await getDb();
  const { patientId } = await searchParams;
  const [departments, doctors, services] = await Promise.all([
    db.department.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.user.findMany({
      where: { isActive: true, role: { in: ["DOCTOR", "SUPER_ADMIN", "ADMIN"] } },
      orderBy: [{ lastName: "asc" }],
    }),
    db.service.findMany({
      where: { isActive: true, type: { in: ["CONSULTATION", "PROCEDURE", "IMAGING"] } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vizitë e re"
        description="Krijo një vizitë të re duke zgjedhur pacientin, mjekun dhe shërbimet."
        breadcrumb={[{ label: "Klinika" }, { label: "Vizitat", href: "/visits" }, { label: "E re" }]}
      />
      <VisitForm
        departments={departments.map((d) => ({ id: d.id, name: d.nameSq }))}
        doctors={doctors.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }))}
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          price: Number(s.price),
          code: s.code,
        }))}
        defaultPatientId={patientId}
      />
    </div>
  );
}
