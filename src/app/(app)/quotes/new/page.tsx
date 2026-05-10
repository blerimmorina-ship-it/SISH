import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db-context";
import { QuoteForm } from "../quote-form";

export const metadata = { title: "Ofertë e re" };
export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const db = await getDb();
  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ofertë e re"
        description="Krijo ofertë të personalizuar për pacient ose prospekt"
        breadcrumb={[{ label: "Financa" }, { label: "Ofertat", href: "/quotes" }, { label: "E re" }]}
      />
      <QuoteForm
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          price: Number(s.price),
        }))}
      />
    </div>
  );
}
