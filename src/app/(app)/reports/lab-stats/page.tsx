import Link from "next/link";
import { TestTube2, PieChart, BarChart3, TrendingUp, Wallet, AlertOctagon, CheckCircle2, Clock, FileDown } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Statistikat e laboratorit" };
export const dynamic = "force-dynamic";

const TABS = [
  { href: "/reports", label: "Përmbledhja", icon: PieChart },
  { href: "/reports/analytics", label: "Analiza", icon: BarChart3 },
  { href: "/reports/revenue", label: "Të ardhurat", icon: TrendingUp },
  { href: "/reports/balance", label: "Bilanci financiar", icon: Wallet },
  { href: "/reports/lab-stats", label: "Laboratori", icon: TestTube2, active: true },
];

export default async function LabStatsPage() {
  const db = await getDb();
  const start30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [orderCount, completedCount, criticalCount, byPriority, byDept, topTests] = await Promise.all([
    db.labOrder.count({ where: { createdAt: { gte: start30 } } }),
    db.labOrder.count({ where: { status: "COMPLETED", completedAt: { gte: start30 } } }),
    db.labResult.count({ where: { flag: "CRITICAL", enteredAt: { gte: start30 } } }),
    db.labOrder.groupBy({
      by: ["priority"],
      _count: { _all: true },
      where: { createdAt: { gte: start30 } },
    }),
    db.labOrder.groupBy({
      by: ["departmentId"],
      _count: { _all: true },
      where: { createdAt: { gte: start30 } },
    }),
    db.labResult.groupBy({
      by: ["parameterId"],
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  const departments = await db.department.findMany({
    where: { id: { in: byDept.map((d) => d.departmentId) } },
  });
  const parameters = await db.labTestParameter.findMany({
    where: { id: { in: topTests.map((t) => t.parameterId) } },
    include: { template: { include: { service: true } } },
  });

  const completionRate = orderCount > 0 ? (completedCount / orderCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistikat e laboratorit"
        description="Volumi, performanca dhe alarmet (30 ditët e fundit)"
        actions={<Button variant="outline" size="sm"><FileDown className="h-4 w-4" /> Eksporto</Button>}
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Urdhra (30 ditë)" value={orderCount} icon={TestTube2} tone="primary" />
        <Stat
          label="Përfunduar"
          value={completedCount}
          icon={CheckCircle2}
          tone="success"
          sub={`${completionRate.toFixed(1)}% throughput`}
        />
        <Stat label="Në proces" value={byPriority.find((p) => p.priority === "urgent")?._count._all ?? 0} icon={Clock} tone="warning" />
        <Stat label="Rezultate kritike" value={criticalCount} icon={AlertOctagon} tone="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sipas prioritetit</CardTitle>
            <CardDescription>Shpërndarja Normal / Urgjent / STAT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byPriority.map((p) => {
                const total = byPriority.reduce((s, x) => s + x._count._all, 0) || 1;
                const pct = (p._count._all / total) * 100;
                const tones: Record<string, string> = { normal: "primary", urgent: "warning", stat: "destructive" };
                return (
                  <div key={p.priority}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-mono uppercase">{p.priority}</span>
                      <span className="font-semibold">{p._count._all} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-${tones[p.priority]}`}
                        style={{
                          width: `${pct}%`,
                          background: tones[p.priority] === "warning" ? "hsl(var(--warning))" : tones[p.priority] === "destructive" ? "hsl(var(--destructive))" : "hsl(var(--primary))",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sipas departamentit</CardTitle>
          </CardHeader>
          <CardContent>
            {byDept.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">Asnjë urdhër</div>
            ) : (
              <ul className="space-y-2">
                {byDept.map((d) => {
                  const dept = departments.find((x) => x.id === d.departmentId);
                  return (
                    <li key={d.departmentId} className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: dept?.color ?? "#6366F1" }} />
                        <span className="text-sm">{dept?.nameSq ?? "—"}</span>
                      </div>
                      <span className="font-mono font-semibold">{d._count._all}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 parametrat më të kërkuar</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topTests.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">Asnjë rezultat</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Parametri</th>
                  <th className="px-4 py-3">Paneli</th>
                  <th className="px-4 py-3 text-right">Sasia</th>
                </tr>
              </thead>
              <tbody>
                {topTests.map((t, i) => {
                  const param = parameters.find((p) => p.id === t.parameterId);
                  return (
                    <tr key={t.parameterId} className="border-b border-border/40 last:border-b-0">
                      <td className="px-4 py-3 text-muted-foreground">#{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{param?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{param?.template.service.name ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">{t._count._all}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone, sub }: { label: string; value: number; icon: React.ElementType; tone: string; sub?: string }) {
  const tones: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 [&_.tone]:text-primary",
    success: "from-success/15 to-success/5 [&_.tone]:text-success",
    warning: "from-warning/15 to-warning/5 [&_.tone]:text-warning",
    destructive: "from-destructive/15 to-destructive/5 [&_.tone]:text-destructive",
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${tones[tone]} border border-border/40 p-5 relative overflow-hidden`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-3xl font-bold tracking-tight tone">{value}</div>
        <Icon className="tone h-8 w-8 opacity-50" />
      </div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
