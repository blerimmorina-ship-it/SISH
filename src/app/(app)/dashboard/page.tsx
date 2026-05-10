import {
  Users,
  Stethoscope,
  TestTube2,
  Receipt,
  CalendarDays,
  Activity,
  TrendingUp,
  Plus,
  Download,
} from "lucide-react";
import Link from "next/link";
import { getDb } from "@/lib/db-context";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { RevenueChart } from "./revenue-chart";
import { DepartmentBreakdown } from "./department-breakdown";

export const metadata = { title: "Paneli" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const db = await getDb();
  const [
    patientCount,
    visitsToday,
    pendingLab,
    totalRevenueAgg,
    recentVisits,
    upcomingAppointments,
    departmentStats,
  ] = await Promise.all([
    db.patient.count({ where: { isActive: true } }),
    db.visit.count({
      where: {
        scheduledAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    db.labOrder.count({ where: { status: { in: ["REQUESTED", "SAMPLE_TAKEN", "IN_PROGRESS"] } } }),
    // Payment goes through Invoice → tenant-scoped via cascade
    db.invoice.aggregate({
      _sum: { paidAmount: true },
      where: { issuedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }).then((r) => ({ _sum: { amount: r._sum.paidAmount } })),
    db.visit.findMany({
      take: 6,
      orderBy: { scheduledAt: "desc" },
      include: { patient: true, doctor: true, department: true },
    }),
    db.appointment.findMany({
      take: 5,
      where: { scheduledAt: { gte: new Date() }, status: { in: ["SCHEDULED", "CONFIRMED"] } },
      orderBy: { scheduledAt: "asc" },
      include: { patient: true, doctor: true },
    }),
    db.visit.groupBy({
      by: ["departmentId"],
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    }),
  ]);

  const departments = await db.department.findMany({
    where: { id: { in: departmentStats.map((d) => d.departmentId) } },
  });
  const departmentBreakdown = departmentStats.map((s) => ({
    name: departments.find((d) => d.id === s.departmentId)?.nameSq ?? "—",
    value: s._count._all,
  }));

  const totalRevenue = Number(totalRevenueAgg._sum.amount ?? 0);

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        title="Mirëmbrëma 👋"
        description="Përmbledhje e shpejtë e aktivitetit të klinikës sot."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Eksporto
            </Button>
            <Button variant="premium" size="sm" asChild>
              <Link href="/visits/new">
                <Plus className="h-4 w-4" /> Vizitë e re
              </Link>
            </Button>
          </>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pacientë aktivë"
          value={patientCount.toLocaleString("sq-AL")}
          icon={Users}
          tone="primary"
          delta={{ value: 12.4, positive: true }}
          description="Total në sistem"
        />
        <StatCard
          label="Vizita sot"
          value={visitsToday}
          icon={Stethoscope}
          tone="accent"
          delta={{ value: 8.1, positive: true }}
          description="Të planifikuara"
        />
        <StatCard
          label="Analiza në pritje"
          value={pendingLab}
          icon={TestTube2}
          tone="warning"
          description="Kërkojnë vëmendje"
        />
        <StatCard
          label="Të ardhura (30 ditë)"
          value={formatCurrency(totalRevenue)}
          icon={Receipt}
          tone="success"
          delta={{ value: 4.2, positive: true }}
          description="Pagesa të arkëtuara"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Të ardhurat (12 muaj)
              </CardTitle>
              <CardDescription>Performanca financiare e klinikës</CardDescription>
            </div>
            <Badge variant="success">+12.4%</Badge>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Departamentet aktive</CardTitle>
            <CardDescription>Vizitat sipas specialitetit</CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentBreakdown data={departmentBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Vizitat e fundit
              </CardTitle>
              <CardDescription>6 vizitat më të fundit</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/visits">Shih të gjitha →</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentVisits.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="Asnjë vizitë akoma"
                description="Krijoni vizitën e parë për të filluar."
              />
            ) : (
              <ul className="space-y-2">
                {recentVisits.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 px-3 py-2.5 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 text-xs font-semibold">
                        {(v.patient.firstName[0] ?? "") + (v.patient.lastName[0] ?? "")}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {v.patient.firstName} {v.patient.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {v.department.nameSq} · {v.doctor?.firstName ?? "—"} {v.doctor?.lastName ?? ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        variant={
                          v.status === "COMPLETED"
                            ? "success"
                            : v.status === "CANCELLED" || v.status === "NO_SHOW"
                              ? "destructive"
                              : v.status === "IN_PROGRESS"
                                ? "info"
                                : "secondary"
                        }
                      >
                        {visitStatusLabel(v.status)}
                      </Badge>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {formatDateTime(v.scheduledAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" /> Terminet e ardhshme
              </CardTitle>
              <CardDescription>5 terminet që vijnë</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/appointments">Kalendar →</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Asnjë termin i planifikuar"
                description="Krijo një termin për pacientin."
              />
            ) : (
              <ul className="space-y-2">
                {upcomingAppointments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 px-3 py-2.5"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {a.patient.firstName} {a.patient.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dr. {a.doctor.firstName} {a.doctor.lastName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatDateTime(a.scheduledAt)}</div>
                      <div className="text-[11px] text-muted-foreground">{a.durationMin} min</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function visitStatusLabel(s: string): string {
  return (
    {
      PENDING: "Në pritje",
      IN_PROGRESS: "Në proces",
      COMPLETED: "Përfunduar",
      CANCELLED: "Anuluar",
      NO_SHOW: "Mungoi",
    } as Record<string, string>
  )[s] ?? s;
}
