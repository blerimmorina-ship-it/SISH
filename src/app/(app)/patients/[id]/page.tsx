import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  FileText,
  TestTube2,
  Stethoscope,
  CalendarPlus,
  Receipt,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { getDb } from "@/lib/db-context";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  calculateAge,
  bloodTypeLabel,
  genderLabel,
  initials,
} from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const db = await getDb();
  const { id } = await params;
  const patient = await db.patient.findUnique({
    where: { id },
    include: {
      visits: {
        take: 10,
        orderBy: { scheduledAt: "desc" },
        include: { department: true, doctor: true },
      },
      labOrders: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { department: true },
      },
      invoices: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { visits: true, labOrders: true, invoices: true } },
    },
  });

  if (!patient) notFound();

  const totalSpend = patient.invoices.reduce((s, i) => s + Number(i.paidAmount), 0);
  const totalDebt = patient.invoices.reduce((s, i) => s + Number(i.balance), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        description={
          <span className="font-mono text-xs text-muted-foreground">
            {patient.code} {patient.personalId && `· ID: ${patient.personalId}`}
          </span> as unknown as string
        }
        breadcrumb={[
          { label: "Klinika" },
          { label: "Pacientët", href: "/patients" },
          { label: `${patient.firstName} ${patient.lastName}` },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/patients">
                <ArrowLeft className="h-4 w-4" /> Kthehu
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/patients/${patient.id}/edit`}>
                <Edit className="h-4 w-4" /> Edito
              </Link>
            </Button>
            <Button variant="premium" size="sm" asChild>
              <Link href={`/visits/new?patientId=${patient.id}`}>
                <CalendarPlus className="h-4 w-4" /> Vizitë e re
              </Link>
            </Button>
          </>
        }
      />

      {/* Top hero card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                <AvatarFallback className="text-2xl">
                  {initials(patient.firstName, patient.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{genderLabel(patient.gender)}</Badge>
                  {patient.bloodType !== "UNKNOWN" && (
                    <Badge variant="destructive">Gjak {bloodTypeLabel(patient.bloodType)}</Badge>
                  )}
                  {patient.dateOfBirth && (
                    <Badge variant="secondary">{calculateAge(patient.dateOfBirth)} vjeç</Badge>
                  )}
                  {patient.allergies && (
                    <Badge variant="warning">
                      <AlertTriangle className="h-3 w-3" /> Alergji
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  {patient.phone && (
                    <Detail icon={<Phone className="h-3.5 w-3.5" />}>{patient.phone}</Detail>
                  )}
                  {patient.email && (
                    <Detail icon={<Mail className="h-3.5 w-3.5" />}>{patient.email}</Detail>
                  )}
                  {patient.address && (
                    <Detail icon={<MapPin className="h-3.5 w-3.5" />}>
                      {patient.address}
                      {patient.city ? `, ${patient.city}` : ""}
                    </Detail>
                  )}
                  {patient.dateOfBirth && (
                    <Detail icon={<Calendar className="h-3.5 w-3.5" />}>
                      Lindur më {formatDate(patient.dateOfBirth)}
                    </Detail>
                  )}
                  {patient.insuranceProvider && (
                    <Detail icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                      {patient.insuranceProvider}
                      {patient.insuranceNumber ? ` · ${patient.insuranceNumber}` : ""}
                    </Detail>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:ml-auto grid grid-cols-3 gap-3 lg:gap-4 w-full lg:w-auto">
              <MiniStat label="Vizita" value={patient._count.visits} icon={Stethoscope} />
              <MiniStat label="Analiza" value={patient._count.labOrders} icon={TestTube2} />
              <MiniStat label="Fatura" value={patient._count.invoices} icon={Receipt} />
            </div>
          </div>

          {(patient.allergies || patient.chronicDiseases) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {patient.allergies && (
                <Banner tone="warning" icon={AlertTriangle} title="Alergjitë">
                  {patient.allergies}
                </Banner>
              )}
              {patient.chronicDiseases && (
                <Banner tone="info" icon={Heart} title="Sëmundjet kronike">
                  {patient.chronicDiseases}
                </Banner>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4 text-primary" /> Vizitat
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/visits?patientId=${patient.id}`}>Të gjitha →</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {patient.visits.length === 0 ? (
              <EmptyState icon={Stethoscope} title="Asnjë vizitë akoma" />
            ) : (
              <ul className="space-y-2">
                {patient.visits.map((v) => (
                  <li key={v.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 px-3 py-2.5">
                    <div>
                      <div className="text-sm font-medium">
                        {v.department.nameSq}
                        {v.diagnosis ? ` · ${v.diagnosis}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {v.doctor ? `Dr. ${v.doctor.firstName} ${v.doctor.lastName}` : "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={v.status === "COMPLETED" ? "success" : "secondary"}>
                        {v.status}
                      </Badge>
                      <div className="text-[11px] text-muted-foreground mt-1">
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
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-primary" /> Financa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/40 bg-card/40 p-3">
              <div className="text-xs text-muted-foreground">Total i paguar</div>
              <div className="text-2xl font-bold tracking-tight text-success">
                {formatCurrency(totalSpend)}
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-card/40 p-3">
              <div className="text-xs text-muted-foreground">Borxh i mbetur</div>
              <div className={`text-2xl font-bold tracking-tight ${totalDebt > 0 ? "text-destructive" : "text-foreground"}`}>
                {formatCurrency(totalDebt)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <TestTube2 className="h-4 w-4 text-primary" /> Analizat laboratorike
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/lab/orders?patientId=${patient.id}`}>Të gjitha →</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {patient.labOrders.length === 0 ? (
            <EmptyState icon={TestTube2} title="Asnjë analizë akoma" />
          ) : (
            <ul className="space-y-2">
              {patient.labOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-medium font-mono">{o.code}</div>
                    <div className="text-xs text-muted-foreground">{o.department.nameSq}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={o.status === "COMPLETED" ? "success" : "info"}>
                      {o.status}
                    </Badge>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {formatDateTime(o.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span>{icon}</span>
      <span className="text-foreground/90">{children}</span>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary mb-1" />
      <div className="text-xl font-bold tracking-tight">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Banner({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: "warning" | "info";
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  const cls = tone === "warning" ? "bg-warning/10 text-warning border-warning/30" : "bg-info/10 text-info border-info/30";
  return (
    <div className={`rounded-lg border p-3 ${cls}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4" /> {title}
      </div>
      <div className="mt-1 text-sm text-foreground/85">{children}</div>
    </div>
  );
}
