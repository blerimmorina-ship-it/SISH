import { FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Dokumente / Pagesa" };

export default function StockDocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumente / Pagesa"
        description="Faturat e furnizuesve, dokumente financiare dhe pagesat"
        breadcrumb={[{ label: "Stoku", href: "/inventory" }, { label: "Dokumente" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Plus className="h-4 w-4" /> Shto Dokument</Button>
            <Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Shto Pagesë</Button>
          </>
        }
      />
      <Card>
        <CardContent className="p-12">
          <EmptyState icon={FileText} title="Asnjë dokument akoma" description="Ngarkо faturat e furnizuesve dhe dokumentet e pagesave për t'i pasur në një vend." />
        </CardContent>
      </Card>
    </div>
  );
}
