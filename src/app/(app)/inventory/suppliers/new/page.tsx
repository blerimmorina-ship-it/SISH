import { PageHeader } from "@/components/ui/page-header";
import { SupplierForm } from "../../supplier-form";

export const metadata = { title: "Furnizues i ri" };

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Furnizues i ri"
        description="Shto kompani furnizuese për të menaxhuar blerjet dhe inventarin"
        breadcrumb={[
          { label: "Stoku", href: "/inventory" },
          { label: "Furnizuesit", href: "/inventory/suppliers" },
          { label: "I ri" },
        ]}
      />
      <SupplierForm />
    </div>
  );
}
