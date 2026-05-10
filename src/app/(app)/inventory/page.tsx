import Link from "next/link";
import {
  PackageSearch,
  ShoppingCart,
  Receipt,
  Truck,
  Building,
  Tags,
  FileText,
  TrendingDown,
} from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Stoku & Financa" };
export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const db = await getDb();
  const [productCount, supplierCount, warehouseCount, purchaseAgg, lowStock] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.supplier.count({ where: { isActive: true } }),
    db.warehouse.count({ where: { isActive: true } }),
    db.purchase.aggregate({
      _sum: { total: true },
      _count: { _all: true },
      where: { receivedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
    }),
    db.product.count({
      where: { isActive: true, minStock: { gt: 0 } },
    }),
  ]);

  const tiles = [
    {
      icon: ShoppingCart,
      title: "Blerjet",
      sub: "Porositë e pranuara",
      value: purchaseAgg._count._all,
      href: "/inventory/purchases",
      tone: "primary" as const,
      action: "Listë / Shto",
    },
    {
      icon: Receipt,
      title: "Shitjet",
      sub: "3 muajt e fundit",
      value: 0,
      href: "/inventory/sales",
      tone: "success" as const,
      action: "Listë / Raporti",
    },
    {
      icon: FileText,
      title: "Dokumente / Pagesa",
      sub: "Dokumentet financiare",
      value: 0,
      href: "/inventory/documents",
      tone: "info" as const,
      action: "Listë / Shto Dok",
    },
    {
      icon: PackageSearch,
      title: "Produktet",
      sub: "Artikujt aktivë",
      value: productCount,
      href: "/inventory/products",
      tone: "primary" as const,
      action: "Lista",
    },
    {
      icon: Truck,
      title: "Furnizuesit",
      sub: "Partnerët",
      value: supplierCount,
      href: "/inventory/suppliers",
      tone: "accent" as const,
      action: "Lista",
    },
    {
      icon: Building,
      title: "Depot",
      sub: "Lokacionet",
      value: warehouseCount,
      href: "/inventory/warehouses",
      tone: "warning" as const,
      action: "Lista",
    },
    {
      icon: Tags,
      title: "Kategoritë",
      sub: "Klasifikim i artikujve",
      value: 0,
      href: "/inventory/categories",
      tone: "info" as const,
      action: "Lista",
    },
    {
      icon: TrendingDown,
      title: "Alarmi i stokut",
      sub: "Nën nivelin minimal",
      value: lowStock,
      href: "/inventory/low-stock",
      tone: "destructive" as const,
      action: "Shih",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stoku & Financa"
        description="Inventari i barnave, reagjentëve dhe materialeve harxhuese"
        breadcrumb={[{ label: "Financa" }, { label: "Stoku" }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.title} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t.title}
                    </div>
                    <div className="mt-1 text-3xl font-bold tracking-tight">{t.value}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{t.sub}</div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 p-2.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline">{t.action}</Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={t.href as never}>Hap →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Vlera e blerjeve (3 muajt e fundit)
              </div>
              <div className="text-3xl font-bold tracking-tight text-gradient mt-1">
                {formatCurrency(Number(purchaseAgg._sum.total ?? 0))}
              </div>
            </div>
            <Button variant="premium" size="sm" asChild>
              <Link href="/inventory/purchases">Të gjitha blerjet →</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
