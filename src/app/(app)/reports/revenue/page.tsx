import Link from "next/link";
import { TrendingUp, PieChart, BarChart3, Wallet, TestTube2, FileDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Të ardhurat" };
export const dynamic = "force-dynamic";

const TABS = [
  { href: "/reports", label: "Përmbledhja", icon: PieChart },
  { href: "/reports/analytics", label: "Analiza", icon: BarChart3 },
  { href: "/reports/revenue", label: "Të ardhurat", icon: TrendingUp, active: true },
  { href: "/reports/balance", label: "Bilanci financiar", icon: Wallet },
  { href: "/reports/lab-stats", label: "Laboratori", icon: TestTube2 },
];

export default async function RevenueReportPage() {
  const db = await getDb();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [thisMonthAgg, lastMonthAgg, byMethod, byDay] = await Promise.all([
    db.payment.aggregate({ _sum: { amount: true }, _count: { _all: true }, where: { paidAt: { gte: startOfMonth } } }),
    db.payment.aggregate({ _sum: { amount: true }, _count: { _all: true }, where: { paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    db.payment.groupBy({ by: ["method"], _sum: { amount: true }, _count: { _all: true }, where: { paidAt: { gte: startOfMonth } } }),
    db.payment.findMany({
      where: { paidAt: { gte: startOfMonth } },
      select: { paidAt: true, amount: true },
    }),
  ]);

  const thisMonth = Number(thisMonthAgg._sum.amount ?? 0);
  const lastMonth = Number(lastMonthAgg._sum.amount ?? 0);
  const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
  const isUp = change >= 0;

  // Daily totals
  const dayMap = new Map<string, number>();
  byDay.forEach((p) => {
    const day = new Date(p.paidAt).toLocaleDateString("sq-AL", { day: "2-digit", month: "2-digit" });
    dayMap.set(day, (dayMap.get(day) ?? 0) + Number(p.amount));
  });
  const days = Array.from(dayMap.entries()).slice(-14);
  const maxDay = Math.max(...days.map(([, v]) => v), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raporti i të ardhurave"
        description={`Performanca në krahasim me muajin e kaluar`}
        actions={<Button variant="outline" size="sm"><FileDown className="h-4 w-4" /> Eksporto PDF</Button>}
      />

      <div className="flex flex-wrap gap-1 border-b border-border/60 -mb-px overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href as never}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                t.active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Muaji aktual</CardDescription>
            <CardTitle className="text-3xl text-gradient">{formatCurrency(thisMonth)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {thisMonthAgg._count._all} pagesa
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Muaji i kaluar</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(lastMonth)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {lastMonthAgg._count._all} pagesa
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Ndryshimi</CardDescription>
            <CardTitle className={`text-3xl flex items-center gap-2 ${isUp ? "text-success" : "text-destructive"}`}>
              {isUp ? <ArrowUpRight className="h-7 w-7" /> : <ArrowDownRight className="h-7 w-7" />}
              {change.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {isUp ? "↑ rritje" : "↓ rënie"} vs muaji i kaluar
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Të ardhura ditore (14 ditë)</CardTitle>
          <CardDescription>Trendi i pagesave ditë pas dite</CardDescription>
        </CardHeader>
        <CardContent>
          {days.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">Asnjë pagesë këtë muaj</div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {days.map(([day, amount]) => {
                const h = (amount / maxDay) * 100;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <div className="text-[10px] font-mono text-muted-foreground">{formatCurrency(amount).replace("€", "")}</div>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-primary to-accent transition-all"
                        style={{ height: `${h}%`, minHeight: "4px" }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground rotate-45 origin-bottom-left whitespace-nowrap">
                      {day}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sipas metodës së pagesës</CardTitle>
        </CardHeader>
        <CardContent>
          {byMethod.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">Asnjë pagesë</div>
          ) : (
            <div className="space-y-3">
              {byMethod.map((m) => {
                const sum = Number(m._sum.amount ?? 0);
                const pct = thisMonth > 0 ? (sum / thisMonth) * 100 : 0;
                const labels: Record<string, string> = { CASH: "Kesh", CARD: "Kartë", BANK_TRANSFER: "Bankë", INSURANCE: "Sigurim", MIXED: "I përzier" };
                return (
                  <div key={m.method}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{labels[m.method] ?? m.method}</span>
                        <span className="text-xs text-muted-foreground">{m._count._all} pagesa</span>
                      </div>
                      <div className="font-mono font-semibold">{formatCurrency(sum)}</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
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
