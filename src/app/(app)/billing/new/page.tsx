import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db-context";
import { InvoiceForm } from "../invoice-form";

export const metadata = { title: "Faturë e re" };
export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string; visitId?: string }>;
}) {
  const db = await getDb();
  const { patientId, visitId } = await searchParams;
  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faturë e re"
        description="Lësho një faturë për pacient duke shtuar shërbimet"
        breadcrumb={[
          { label: "Financa" },
          { label: "Faturimi", href: "/billing" },
          { label: "E re" },
        ]}
      />
      <InvoiceForm
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          price: Number(s.price),
          vatRate: Number(s.vatRate),
        }))}
        defaultPatientId={patientId}
        defaultVisitId={visitId}
      />
    </div>
  );
}
