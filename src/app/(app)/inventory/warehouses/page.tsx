import Link from "next/link";
import { Plus, Building2, MapPin, Package } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Depot" };
export const dynamic = "force-dynamic";

export default async function WarehousesPage() {
  const db = await getDb();
  const warehouses = await db.warehouse.findMany({
    orderBy: { name: "asc" },
    include: { stockLevels: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Depot"
        description={`${warehouses.length} depo aktive`}
        breadcrumb={[{ label: "Stoku", href: "/inventory" }, { label: "Depot" }]}
        actions={<Button variant="premium" size="sm" asChild><Link href="/inventory/warehouses/new"><Plus className="h-4 w-4" /> Depo e re</Link></Button>}
      />

      {warehouses.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState icon={Building2} title="Asnjë depo" description="Krijo depot/lokacionet ku ruhet stoku." />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((w) => {
            const totalItems = w.stockLevels.length;
            const totalQty = w.stockLevels.reduce((s, l) => s + Number(l.quantity), 0);
            return (
              <Card key={w.id} className="card-hover">
                <CardContent className="p-5">
                  <div className="rounded-xl bg-primary/10 p-2.5 w-fit mb-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{w.name}</h3>
                  <div className="text-xs text-muted-foreground font-mono">{w.code}</div>
                  {w.address && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {w.address}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline"><Package className="h-3 w-3" /> {totalItems} artikuj</Badge>
                    <Badge variant="secondary">{totalQty.toFixed(0)} njësi</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
