import Link from "next/link";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Users,
  FileDown,
  Calendar,
  Stethoscope,
  Clock,
  CheckCircle2,
  Building2,
  Wallet,
  TestTube2,
} from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Raportet" };
export const dynamic = "force-dynamic";

const REPORT_TABS = [
  { href: "/reports", label: "Përmbledhja", icon: PieChart, active: true },
  { href: "/reports/analytics", label: "Analiza", icon: BarChart3 },
  { href: "/reports/revenue", label: "Të ardhurat", icon: TrendingUp },
  { href: "/reports/balance", label: "Bilanci financiar", icon: Wallet },
  { href: "/reports/lab-stats", label: "Laboratori", icon: TestTube2 },
];

export default async function ReportsPage() {
  const db = await getDb();
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    todayVisits,
    pendingVisits,
    completedVisits,
    departmentCount,
    patientCount,
    totalVisits,
    userCount,
    revenueAgg,
    debtAgg,
    debtors,
  ] = await Promise.all([
    db.visit.count({ where: { scheduledAt: { gte: startOfDay } } }),
    db.visit.count({ where: { status: "PENDING" } }),
    db.visit.count({ where: { status: "COMPLETED" } }),
    db.department.count({ where: { isActive: true } }),
    db.patient.count({ where: { isActive: true } }),
    db.visit.count(),
    db.user.count({ where: { isActive: true } }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { paidAt: { gte: startOfMonth } },
    }),
    db.invoice.aggregate({
      _sum: { balance: true },
      where: { status: { in: ["ISSUED", "PARTIALLY_PAID"] } },
    }),
    db.invoice.findMany({
      take: 10,
      orderBy: { balance: "desc" },
      where: { balance: { gt: 0 } },
      include: { patient: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raportet"
        description="Analiza dhe statistika të avancuara të biznesit"
        breadcrumb={[{ label: "Analiza" }, { label: "Raportet" }]}
        actions={
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4" /> Eksporto PDF
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1 border-b border-border/60 -mb-px overflow-x-auto scroll-thin">
        {REPORT_TABS.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href as never}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                t.active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Vizitat e sotme" value={todayVisits} icon={Calendar} tone="primary" />
        <KPI label="Vizitat në pritje" value={pendingVisits} icon={Clock} tone="warning" />
        <KPI label="Vizitat e përfunduara" value={completedVisits} icon={CheckCircle2} tone="success" />
        <KPI label="Departamente aktive" value={departmentCount} icon={Building2} tone="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Krahaso periudhat</CardTitle>
              <CardDescription>Performanca midis dy periudhave kohore</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <select className="rounded-md border border-input bg-background/60 px-2 py-1.5">
                <option>Prill 2026</option>
                <option>Mars 2026</option>
              </select>
              <span className="text-muted-foreground">vs</span>
              <select className="rounded-md border border-input bg-background/60 px-2 py-1.5">
                <option>Maj 2026</option>
                <option>Prill 2026</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-border/40 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Grafiku i krahasimit (5 javë)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Përmbledhja e shpejtë</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Mini icon={Users} label="Pacientë" value={patientCount} tone="primary" />
            <Mini icon={Stethoscope} label="Vizitat (total)" value={totalVisits} tone="warning" />
            <Mini icon={Users} label="Përdorues aktivë" value={userCount} tone="destructive" />
            <Mini icon={TrendingUp} label="Të ardhura këtë muaj" value={formatCurrency(Number(revenueAgg._sum.amount ?? 0))} tone="success" />
            <Mini icon={Wallet} label="Borxh i hapur" value={formatCurrency(Number(debtAgg._sum.balance ?? 0))} tone="destructive" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gjendja financiare e pacientëve</CardTitle>
          <CardDescription>Top 10 pacientët me borxh të hapur</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {debtors.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              ✅ Nuk ka pacientë me borxh
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Kodi</th>
                  <th className="px-4 py-3">Pacienti</th>
                  <th className="px-4 py-3">Faturë</th>
                  <th className="px-4 py-3">Telefoni</th>
                  <th className="px-4 py-3 text-right">Borxhi</th>
                </tr>
              </thead>
              <tbody>
                {debtors.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                    <td className="px-4 py-3 font-mono text-xs">{inv.patient.code}</td>
                    <td className="px-4 py-3">
                      <Link href={`/patients/${inv.patient.id}` as never} className="hover:text-primary">
                        {inv.patient.firstName} {inv.patient.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.number}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{inv.patient.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-destructive">
                      {formatCurrency(Number(inv.balance))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportCard title="Performanca financiare" description="Të ardhurat sipas muajit, departamentit dhe shërbimit." icon={TrendingUp} href="/reports/financial" />
        <ReportCard title="Aktiviteti klinik" description="Vizitat, diagnozat dhe ngarkesa për mjek." icon={BarChart3} href="/reports/clinical" />
        <ReportCard title="Demografia e pacientëve" description="Mosha, gjinia, qyteti dhe sigurimi." icon={Users} href="/reports/demographics" />
        <ReportCard title="Performanca laboratorike" description="Volumi i analizave, koha mesatare e procesimit." icon={PieChart} href="/reports/lab" />
      </div>
    </div>
  );
}

function KPI({ label, value, icon: Icon, tone }: { label: string; value: number | string; icon: React.ElementType; tone: string }) {
  const tones: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 [&_.tone]:text-primary",
    warning: "from-warning/15 to-warning/5 [&_.tone]:text-warning",
    success: "from-success/15 to-success/5 [&_.tone]:text-success",
    info: "from-info/15 to-info/5 [&_.tone]:text-info",
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${tones[tone]} border border-border/40 p-5 relative overflow-hidden`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-3xl font-bold tracking-tight tone">{value}</div>
        <Icon className="tone h-8 w-8 opacity-50" />
      </div>
    </div>
  );
}

function Mini({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: number | string; tone: string }) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 px-3 py-2.5">
      <div className={`rounded-lg p-2 ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}

function ReportCard({ title, description, icon: Icon, href }: { title: string; description: string; icon: React.ElementType; href: string }) {
  return (
    <Card className="card-hover">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="rounded-xl p-3 bg-gradient-to-br from-primary/15 to-accent/15">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{title}</h3>
            <Badge variant="outline">PDF / Excel</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={href as never}>Hap →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
