import { PageHeader } from "@/components/ui/page-header";
import { WarehouseForm } from "../../warehouse-form";

export const metadata = { title: "Depo e re" };

export default function NewWarehousePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Depo e re"
        description="Krijo lokacion për ruajtjen e produkteve"
        breadcrumb={[
          { label: "Stoku", href: "/inventory" },
          { label: "Depot", href: "/inventory/warehouses" },
          { label: "E re" },
        ]}
      />
      <WarehouseForm />
    </div>
  );
}
