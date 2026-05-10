import { Pill } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Recetat" };

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recetat Mjekësore"
        description="Recetat e lëshuara nga mjekët"
        breadcrumb={[{ label: "Klinika" }, { label: "Recetat" }]}
      />
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon={Pill}
            title="Asnjë recetë akoma"
            description="Recetat shfaqen këtu pasi të krijohen nga mjekët gjatë vizitave."
          />
        </CardContent>
      </Card>
    </div>
  );
}
