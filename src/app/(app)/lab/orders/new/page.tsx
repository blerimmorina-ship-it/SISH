import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db-context";
import { LabOrderForm } from "../../lab-order-form";

export const metadata = { title: "Urdhër laboratorik i ri" };
export const dynamic = "force-dynamic";

export default async function NewLabOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const db = await getDb();
  const { patientId } = await searchParams;
  const [departments, templates] = await Promise.all([
    db.department.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.labTestTemplate.findMany({
      include: { service: true, parameters: true },
      orderBy: { category: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Urdhër laboratorik i ri"
        description="Krijo një urdhër me parametrat e analizave"
        breadcrumb={[
          { label: "Laboratori" },
          { label: "Urdhrat", href: "/lab/orders" },
          { label: "I ri" },
        ]}
      />
      <LabOrderForm
        departments={departments.map((d) => ({ id: d.id, name: d.nameSq }))}
        templates={templates.map((t) => ({
          id: t.id,
          serviceId: t.service.id,
          name: t.service.name,
          code: t.service.code,
          category: t.category,
          parametersCount: t.parameters.length,
          price: Number(t.service.price),
        }))}
        defaultPatientId={patientId}
      />
    </div>
  );
}
