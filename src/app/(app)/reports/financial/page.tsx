import { TrendingUp, FileDown, Calendar, Wallet } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Raporti Financiar" };
export const dynamic = "force-dynamic";

export default async function FinancialReportPage() {
  const db = await getDb();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  const [monthRev, yearRev, monthInvoices, dueAgg, byMethod] = await Promise.all([
    db.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: startOfMonth } } }),
    db.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: startOfYear } } }),
    db.invoice.aggregate({
      _sum: { total: true },
      _count: { _all: true },
      where: { issuedAt: { gte: startOfMonth } },
    }),
    db.invoice.aggregate({
      _sum: { balance: true },
      where: { status: { in: ["ISSUED", "PARTIALLY_PAID"] } },
    }),
    db.payment.groupBy({
      by: ["method"],
      where: { paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  const methodLabels: Record<string, string> = {
    CASH: "Kesh",
    CARD: "Kartë",
    BANK_TRANSFER: "Transfertë bankare",
    INSURANCE: "Sigurim",
    MIXED: "I përzier",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raporti Financiar"
        description="Të ardhurat, faturat dhe bilanci për periudhën aktuale"
        breadcrumb={[
          { label: "Analiza" },
          { label: "Raportet", href: "/reports" },
          { label: "Financiar" },
        ]}
        actions={
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4" /> Eksporto PDF
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Të ardhura këtë muaj" value={formatCurrency(Number(monthRev._sum.amount ?? 0))} icon={TrendingUp} tone="success" />
        <StatCard label="Të ardhura këtë vit" value={formatCurrency(Number(yearRev._sum.amount ?? 0))} icon={Calendar} tone="primary" />
        <StatCard label="Fatura këtë muaj" value={String(monthInvoices._count._all)} icon={Wallet} tone="info" description={formatCurrency(Number(monthInvoices._sum.total ?? 0))} />
        <StatCard label="Borxh i hapur" value={formatCurrency(Number(dueAgg._sum.balance ?? 0))} icon={TrendingUp} tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagesat sipas metodës (muaji aktual)</CardTitle>
        </CardHeader>
        <CardContent>
          {byMethod.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Asnjë pagesë e regjistruar këtë muaj.
            </div>
          ) : (
            <div className="space-y-3">
              {byMethod.map((m) => {
                const sum = Number(m._sum.amount ?? 0);
                const total = byMethod.reduce((s, x) => s + Number(x._sum.amount ?? 0), 0) || 1;
                const pct = (sum / total) * 100;
                return (
                  <div key={m.method}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{methodLabels[m.method] ?? m.method}</span>
                        <Badge variant="outline">{m._count._all}</Badge>
                      </div>
                      <div className="text-sm font-mono font-semibold">{formatCurrency(sum)}</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
