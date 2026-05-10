import { Activity, Stethoscope, FileDown, TrendingUp, Users } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "Raporti Klinik" };
export const dynamic = "force-dynamic";

export default async function ClinicalReportPage() {
  const db = await getDb();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [visitCount, completedCount, byDept, byDoctor] = await Promise.all([
    db.visit.count({ where: { scheduledAt: { gte: startOfMonth } } }),
    db.visit.count({ where: { status: "COMPLETED", completedAt: { gte: startOfMonth } } }),
    db.visit.groupBy({
      by: ["departmentId"],
      where: { scheduledAt: { gte: startOfMonth } },
      _count: { _all: true },
    }),
    db.visit.groupBy({
      by: ["doctorId"],
      where: { scheduledAt: { gte: startOfMonth }, doctorId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  const [departments, doctors] = await Promise.all([
    db.department.findMany({ where: { id: { in: byDept.map((d) => d.departmentId) } } }),
    db.user.findMany({
      where: { id: { in: byDoctor.filter((d) => d.doctorId).map((d) => d.doctorId!) } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raporti Klinik"
        description="Aktiviteti i klinikës: vizitat, mjekët dhe departamentet"
        breadcrumb={[
          { label: "Analiza" },
          { label: "Raportet", href: "/reports" },
          { label: "Klinik" },
        ]}
        actions={<Button variant="outline" size="sm"><FileDown className="h-4 w-4" /> Eksporto PDF</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Vizita këtë muaj" value={visitCount} icon={Stethoscope} tone="primary" />
        <StatCard label="Përfunduar" value={completedCount} icon={Activity} tone="success" description={`${visitCount > 0 ? Math.round((completedCount / visitCount) * 100) : 0}% rate`} />
        <StatCard label="Departamente aktive" value={byDept.length} icon={TrendingUp} tone="info" />
        <StatCard label="Mjekë aktivë" value={byDoctor.length} icon={Users} tone="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader><CardTitle>Vizitat sipas departamentit</CardTitle></CardHeader>
          <CardContent>
            {byDept.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">Asnjë vizitë këtë muaj</div>
            ) : (
              <div className="space-y-2">
                {byDept.map((d) => {
                  const dept = departments.find((x) => x.id === d.departmentId);
                  const total = byDept.reduce((s, x) => s + x._count._all, 0) || 1;
                  const pct = (d._count._all / total) * 100;
                  return (
                    <div key={d.departmentId}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{dept?.nameSq ?? "—"}</span>
                        <span className="font-mono font-semibold">{d._count._all}</span>
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

        <Card>
          <CardHeader><CardTitle>Top mjekët</CardTitle></CardHeader>
          <CardContent>
            {byDoctor.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">Asnjë vizitë me mjek të caktuar</div>
            ) : (
              <ul className="space-y-2">
                {byDoctor.map((d, i) => {
                  const doc = doctors.find((u) => u.id === d.doctorId);
                  return (
                    <li key={d.doctorId} className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 text-xs font-mono text-muted-foreground">#{i + 1}</div>
                        <div className="font-medium text-sm">
                          {doc ? `Dr. ${doc.firstName} ${doc.lastName}` : "—"}
                        </div>
                      </div>
                      <div className="font-mono font-semibold">{d._count._all}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
