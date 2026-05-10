import Link from "next/link";
import { Plus, PackageSearch, AlertTriangle } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Produktet" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const db = await getDb();
  const products = await db.product.findMany({
    take: 100,
    orderBy: { name: "asc" },
    include: { category: true, stockLevels: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produktet"
        description={`${products.length} artikuj në katalog`}
        breadcrumb={[{ label: "Stoku", href: "/inventory" }, { label: "Produktet" }]}
        actions={
          <Button variant="premium" size="sm" asChild>
            <Link href="/inventory/products/new"><Plus className="h-4 w-4" /> Produkt i ri</Link>
          </Button>
        }
      />

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={PackageSearch}
              title="Asnjë produkt"
              description="Shto barna, reagjentë, materiale harxhuese që përdoren në klinikë."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Kodi</th>
                    <th className="px-4 py-3">Emri</th>
                    <th className="px-4 py-3">Kategoria</th>
                    <th className="px-4 py-3">Njësia</th>
                    <th className="px-4 py-3 text-right">Çmim. blerjeje</th>
                    <th className="px-4 py-3 text-right">Çmim. shitjeje</th>
                    <th className="px-4 py-3 text-right">Stoku</th>
                    <th className="px-4 py-3">Statusi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const totalStock = p.stockLevels.reduce((s, l) => s + Number(l.quantity), 0);
                    const lowStock = p.minStock > 0 && totalStock < p.minStock;
                    return (
                      <tr key={p.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                        <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{p.category?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-xs">{p.unit}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatCurrency(Number(p.buyPrice))}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(Number(p.sellPrice))}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={lowStock ? "text-warning font-semibold" : ""}>{totalStock}</span>
                        </td>
                        <td className="px-4 py-3">
                          {lowStock ? (
                            <Badge variant="warning"><AlertTriangle className="h-3 w-3" /> Nën min.</Badge>
                          ) : (
                            <Badge variant="success">OK</Badge>
                          )}
                        </td>
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
