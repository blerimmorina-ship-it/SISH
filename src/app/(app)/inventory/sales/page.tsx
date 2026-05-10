import { Receipt, FileDown } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Shitjet" };

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shitjet"
        description="Përmbledhje e produkteve të shitura në 3 muajt e fundit"
        breadcrumb={[{ label: "Stoku", href: "/inventory" }, { label: "Shitjet" }]}
        actions={<Button variant="outline" size="sm"><FileDown className="h-4 w-4" /> Eksporto</Button>}
      />
      <Card>
        <CardContent className="p-12">
          <EmptyState icon={Receipt} title="Asnjë shitje akoma" description="Shitjet do të shfaqen pasi të lëshohen fatura me artikuj nga stoku." />
        </CardContent>
      </Card>
    </div>
  );
}
