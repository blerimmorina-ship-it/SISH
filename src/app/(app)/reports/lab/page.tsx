import { TestTube2, FileDown, AlertOctagon, CheckCircle2 } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "Raporti Laboratorik" };
export const dynamic = "force-dynamic";

export default async function LabReportPage() {
  const db = await getDb();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [orderCount, completedCount, byStatus, criticalResults] = await Promise.all([
    db.labOrder.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.labOrder.count({ where: { status: "COMPLETED", completedAt: { gte: startOfMonth } } }),
    db.labOrder.groupBy({ by: ["status"], _count: { _all: true } }),
    db.labResult.count({ where: { flag: "CRITICAL", enteredAt: { gte: startOfMonth } } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raporti Laboratorik"
        description="Volumi, performanca dhe alarmet e laboratorit"
        breadcrumb={[
          { label: "Analiza" },
          { label: "Raportet", href: "/reports" },
          { label: "Laboratori" },
        ]}
        actions={<Button variant="outline" size="sm"><FileDown className="h-4 w-4" /> Eksporto</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Urdhra këtë muaj" value={orderCount} icon={TestTube2} tone="primary" />
        <StatCard
          label="Përfunduar"
          value={completedCount}
          icon={CheckCircle2}
          tone="success"
          description={`${orderCount > 0 ? Math.round((completedCount / orderCount) * 100) : 0}% throughput`}
        />
        <StatCard label="Në proces" value={byStatus.find((s) => s.status === "IN_PROGRESS")?._count._all ?? 0} icon={TestTube2} tone="warning" />
        <StatCard label="Rezultate kritike" value={criticalResults} icon={AlertOctagon} tone="destructive" />
      </div>

      <Card>
        <CardHeader><CardTitle>Urdhrat sipas statusit (që nga fillimi)</CardTitle></CardHeader>
        <CardContent>
          {byStatus.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">Nuk ka urdhra ende</div>
          ) : (
            <div className="space-y-2">
              {byStatus.map((s) => {
                const total = byStatus.reduce((sum, x) => sum + x._count._all, 0) || 1;
                const pct = (s._count._all / total) * 100;
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{s.status}</span>
                      <span className="font-mono">{s._count._all} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
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
