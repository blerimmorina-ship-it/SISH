import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db-context";
import { ClinicalTemplateForm } from "../template-form";

export const metadata = { title: "Shabllon klinik i ri" };
export const dynamic = "force-dynamic";

export default async function NewTemplatePage() {
  const db = await getDb();
  const departments = await db.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shabllon klinik i ri"
        description="Krijo një frazë të paracaktuar që mjekët mund ta zgjedhin shpejt"
        breadcrumb={[
          { label: "Klinika" },
          { label: "Shabllonet", href: "/clinical-templates" },
          { label: "I ri" },
        ]}
      />
      <ClinicalTemplateForm
        departments={departments.map((d) => ({ id: d.id, name: d.nameSq }))}
      />
    </div>
  );
}
