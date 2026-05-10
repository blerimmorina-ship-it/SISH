import { Plus, ScrollText, Edit, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Referuesit" };

export default function ReferrersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Referuesit"
        description="Mjekë dhe profesionistë që referojnë pacientë në klinikë"
        actions={<Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Referues i ri</Button>}
      />

      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon={ScrollText}
            title="Asnjë referues akoma"
            description="Shto mjekë të jashtëm që referojnë pacientë te klinika juaj. Mund të ndjekësh statistika referimi për secilin."
            action={<Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Shto referuesin e parë</Button>}
          />
        </CardContent>
      </Card>
    </div>
  );
}
