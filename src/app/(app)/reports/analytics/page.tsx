import Link from "next/link";
import { BarChart3, PieChart, TrendingUp, Wallet, TestTube2, Calendar } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Analiza" };
export const dynamic = "force-dynamic";

const TABS = [
  { href: "/reports", label: "Përmbledhja", icon: PieChart },
  { href: "/reports/analytics", label: "Analiza", icon: BarChart3, active: true },
  { href: "/reports/revenue", label: "Të ardhurat", icon: TrendingUp },
  { href: "/reports/balance", label: "Bilanci financiar", icon: Wallet },
  { href: "/reports/lab-stats", label: "Laboratori", icon: TestTube2 },
];

export default async function AnalyticsPage() {
  const db = await getDb();
  const start30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [byHour, byDay, byDept] = await Promise.all([
    db.visit.groupBy({ by: ["scheduledAt"], _count: { _all: true } }),
    db.visit.findMany({
      where: { scheduledAt: { gte: start30 } },
      select: { scheduledAt: true, status: true },
    }),
    db.visit.groupBy({
      by: ["departmentId"],
      _count: { _all: true },
      where: { scheduledAt: { gte: start30 } },
    }),
  ]);

  const departments = await db.department.findMany({
    where: { id: { in: byDept.map((d) => d.departmentId) } },
  });

  // Day-of-week distribution
  const dayCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  byDay.forEach((v) => {
    dayCount[new Date(v.scheduledAt).getDay()]++;
  });
  const days = ["Diel", "Hënë", "Martë", "Mërkurë", "Enjte", "Premte", "Shtunë"];
  const maxDay = Math.max(...Object.values(dayCount), 1);

  // Status distribution
  const statusCount = byDay.reduce<Record<string, number>>((acc, v) => {
    acc[v.status] = (acc[v.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analiza e thelluar"
        description="Insights mbi modelet e përdorimit dhe performancën"
        breadcrumb={[{ label: "Analiza" }, { label: "Raportet", href: "/reports" }, { label: "Analiza" }]}
      />

      <div className="flex flex-wrap gap-1 border-b border-border/60 -mb-px overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href as never}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                t.active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Vizitat sipas ditës (30 ditë)
            </CardTitle>
            <CardDescription>Cilën ditë të javës është më e ngarkuar klinika?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(dayCount).map(([d, count]) => {
                const dayName = days[Number(d)];
                const pct = (count / maxDay) * 100;
                const isWeekend = Number(d) === 0 || Number(d) === 6;
                return (
                  <div key={d}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={isWeekend ? "text-muted-foreground" : ""}>{dayName}</span>
                      <span className="font-mono">{count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isWeekend ? "bg-muted-foreground/40" : "bg-gradient-to-r from-primary to-accent"}`}
                        style={{ width: `${pct}%` }}
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
            <CardTitle className="text-base">Statusi i vizitave</CardTitle>
            <CardDescription>Shpërndarja gjatë 30 ditëve të fundit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(statusCount).map(([s, count]) => {
              const total = Object.values(statusCount).reduce((a, b) => a + b, 0) || 1;
              const pct = (count / total) * 100;
              const tone =
                s === "COMPLETED" ? "success" : s === "PENDING" ? "warning" : s === "CANCELLED" ? "destructive" : "secondary";
              return (
                <div key={s}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={tone as never}>{s}</Badge>
                    <span className="text-sm font-mono">{count} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full bg-${tone}/70 rounded-full`}
                      style={{ width: `${pct}%`, background: tone === "success" ? "hsl(var(--success))" : tone === "warning" ? "hsl(var(--warning))" : tone === "destructive" ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ngarkesa sipas departamentit</CardTitle>
          <CardDescription>Sa vizita ka pasur secili departament në 30 ditë</CardDescription>
        </CardHeader>
        <CardContent>
          {byDept.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">Asnjë vizitë në 30 ditët e fundit</div>
          ) : (
            <div className="space-y-2">
              {byDept.map((d) => {
                const dept = departments.find((x) => x.id === d.departmentId);
                const total = byDept.reduce((s, x) => s + x._count._all, 0) || 1;
                const pct = (d._count._all / total) * 100;
                return (
                  <div key={d.departmentId}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: dept?.color ?? "#6366F1" }} />
                        <span>{dept?.nameSq ?? "—"}</span>
                      </div>
                      <span className="font-mono">{d._count._all} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: dept?.color ?? "hsl(var(--primary))" }}
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
