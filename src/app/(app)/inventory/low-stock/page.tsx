import { TrendingDown, AlertTriangle } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Alarmi i stokut" };
export const dynamic = "force-dynamic";

export default async function LowStockPage() {
  const db = await getDb();
  const products = await db.product.findMany({
    where: { isActive: true, minStock: { gt: 0 } },
    include: { stockLevels: true, category: true },
  });
  const lowStock = products.filter((p) => {
    const total = p.stockLevels.reduce((s, l) => s + Number(l.quantity), 0);
    return total < p.minStock;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alarmi i stokut"
        description={`${lowStock.length} produkte janë nën nivelin minimal`}
        breadcrumb={[{ label: "Stoku", href: "/inventory" }, { label: "Alarmi" }]}
      />
      {lowStock.length === 0 ? (
        <Card><CardContent className="p-12"><EmptyState icon={TrendingDown} title="Të gjitha produktet janë mbi minimumin" /></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Kodi</th>
                  <th className="px-4 py-3">Produkti</th>
                  <th className="px-4 py-3">Kategoria</th>
                  <th className="px-4 py-3 text-right">Stok aktual</th>
                  <th className="px-4 py-3 text-right">Minimum</th>
                  <th className="px-4 py-3">Statusi</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => {
                  const total = p.stockLevels.reduce((s, l) => s + Number(l.quantity), 0);
                  return (
                    <tr key={p.id} className="border-b border-border/40 last:border-b-0">
                      <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.category?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-mono text-warning font-semibold">{total}</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">{p.minStock}</td>
                      <td className="px-4 py-3"><Badge variant="warning"><AlertTriangle className="h-3 w-3" /> Riporosit</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
