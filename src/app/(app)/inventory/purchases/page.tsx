import { Plus, ShoppingCart, Filter } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Blerjet" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; variant: "secondary" | "info" | "success" | "destructive" }> = {
  DRAFT: { label: "Skicë", variant: "secondary" },
  RECEIVED: { label: "Pranuar", variant: "success" },
  CANCELLED: { label: "Anuluar", variant: "destructive" },
};

export default async function PurchasesPage() {
  const db = await getDb();
  const purchases = await db.purchase.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { supplier: true, items: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blerjet"
        description={`${purchases.length} porosi në sistem`}
        breadcrumb={[{ label: "Stoku", href: "/inventory" }, { label: "Blerjet" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4" /> Filtro</Button>
            <Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Blerje e re</Button>
          </>
        }
      />

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState icon={ShoppingCart} title="Asnjë blerje akoma" description="Krijo porosinë e parë te furnizuesi." />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Numri</th>
                    <th className="px-4 py-3">Furnizuesi</th>
                    <th className="px-4 py-3">Artikuj</th>
                    <th className="px-4 py-3">Statusi</th>
                    <th className="px-4 py-3">Pranuar</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => {
                    const s = STATUS_LABELS[p.status] ?? { label: p.status, variant: "secondary" as const };
                    return (
                      <tr key={p.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                        <td className="px-4 py-3 font-mono text-xs">{p.number}</td>
                        <td className="px-4 py-3">{p.supplier.name}</td>
                        <td className="px-4 py-3"><Badge variant="outline">{p.items.length}</Badge></td>
                        <td className="px-4 py-3"><Badge variant={s.variant}>{s.label}</Badge></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{p.receivedAt ? formatDateTime(p.receivedAt) : "—"}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(Number(p.total))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
