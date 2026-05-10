import { PageHeader } from "@/components/ui/page-header";
import { DischargeForm } from "../discharge-form";

export const metadata = { title: "Fletëlëshim i ri" };

export default function NewDischargePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fletëlëshim i ri"
        description="Plotëso të dhënat e lëshimit dhe rekomandimet pas trajtimit"
        breadcrumb={[
          { label: "Klinika" },
          { label: "Fletëlëshimet", href: "/discharge" },
          { label: "I ri" },
        ]}
      />
      <DischargeForm />
    </div>
  );
}
