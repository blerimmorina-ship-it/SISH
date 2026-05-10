import { Tag } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Ofertat" };
export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const db = await getDb();
  const services = await db.service.findMany({
    where: { isActive: true },
    include: { department: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    take: 80,
  });

  const grouped = services.reduce<Record<string, typeof services>>((acc, s) => {
    const key = s.department?.nameSq ?? "Pa departament";
    (acc[key] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ofertat & Çmimet"
        description="Lista e shërbimeve dhe pakot me çmimet"
        breadcrumb={[{ label: "Financa" }, { label: "Ofertat" }]}
      />

      {services.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Tag}
              title="Asnjë shërbim aktiv"
              description="Krijo shërbimet me çmimet përkatëse për t'i përdorur në fatura."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dep, items]) => (
            <div key={dep}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{dep}</h2>
                <Badge variant="outline">{items.length}</Badge>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/40">
                    {items.map((s) => (
                      <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent/5">
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{s.code}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold tracking-tight text-gradient">
                            {formatCurrency(Number(s.price))}
                          </div>
                          {Number(s.vatRate) > 0 && (
                            <div className="text-[11px] text-muted-foreground">
                              + TVSH {Number(s.vatRate)}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
