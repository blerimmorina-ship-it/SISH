import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db-context";
import { VisitForm, type VisitInitialValues } from "../../visit-form";

export const metadata = { title: "Edito vizitën" };
export const dynamic = "force-dynamic";

export default async function EditVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const db = await getDb();
  const { id } = await params;

  const [visit, departments, doctors] = await Promise.all([
    db.visit.findUnique({
      where: { id },
      include: {
        patient: true,
        services: { include: { service: true } },
      },
    }),
    db.department.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.user.findMany({
      where: { isActive: true, role: { in: ["DOCTOR", "SUPER_ADMIN", "ADMIN"] } },
      orderBy: [{ lastName: "asc" }],
    }),
  ]);

  if (!visit) notFound();

  // Shërbimet: filtrimi standard + ato që janë tashmë në vizitë (mund të mos
  // përshtaten me filtrin nëse tipi është ndryshe)
  const existingServiceIds = visit.services.map((vs) => vs.serviceId);
  const services = await db.service.findMany({
    where: {
      isActive: true,
      OR: [
        { type: { in: ["CONSULTATION", "PROCEDURE", "IMAGING"] } },
        { id: { in: existingServiceIds } },
      ],
    },
    orderBy: { name: "asc" },
  });

  const initialVisit: VisitInitialValues = {
    id: visit.id,
    code: visit.code,
    patient: {
      id: visit.patient.id,
      firstName: visit.patient.firstName,
      lastName: visit.patient.lastName,
      code: visit.patient.code,
      phone: visit.patient.phone,
    },
    departmentId: visit.departmentId,
    doctorId: visit.doctorId,
    scheduledAt: visit.scheduledAt.toISOString(),
    reason: visit.reason,
    diagnosis: visit.diagnosis,
    symptoms: visit.symptoms,
    notes: visit.notes,
    serviceIds: existingServiceIds,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edito vizitën ${visit.code}`}
        description={`${visit.patient.firstName} ${visit.patient.lastName}`}
        breadcrumb={[
          { label: "Klinika" },
          { label: "Vizitat", href: "/visits" },
          { label: visit.code, href: `/visits/${visit.id}` as never },
          { label: "Edito" },
        ]}
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
        initialVisit={initialVisit}
      />
    </div>
  );
}
