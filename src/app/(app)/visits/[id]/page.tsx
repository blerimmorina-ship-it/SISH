import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Stethoscope,
  Calendar,
  ClipboardList,
  TestTube2,
  Receipt,
  Plus,
} from "lucide-react";
import { getDb } from "@/lib/db-context";
import { VisitStatusActions } from "./status-actions";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }> = {
  PENDING: { label: "Në pritje", variant: "secondary" },
  IN_PROGRESS: { label: "Në proces", variant: "info" },
  COMPLETED: { label: "Përfunduar", variant: "success" },
  CANCELLED: { label: "Anuluar", variant: "destructive" },
  NO_SHOW: { label: "Mungoi", variant: "warning" },
};

export default async function VisitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  const visit = await db.visit.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: true,
      department: true,
      services: { include: { service: true } },
      labOrders: true,
      prescriptions: { include: { items: true } },
      invoice: true,
    },
  });
  if (!visit) notFound();

  const statusVariant = STATUS_LABELS[visit.status] ?? { label: visit.status, variant: "secondary" as const };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Vizitë ${visit.code}`}
        description={`${visit.patient.firstName} ${visit.patient.lastName} · ${visit.department.nameSq}`}
        breadcrumb={[
          { label: "Klinika" },
          { label: "Vizitat", href: "/visits" },
          { label: visit.code },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/visits">
                <ArrowLeft className="h-4 w-4" /> Kthehu
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/visits/${visit.id}/edit`}>
                <Edit className="h-4 w-4" /> Edito
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/lab/orders/new?patientId=${visit.patientId}&visitId=${visit.id}` as never}>
                <TestTube2 className="h-4 w-4" /> Urdhër lab
              </Link>
            </Button>
            <VisitStatusActions
              visit={{
                id: visit.id,
                status: visit.status,
                patientId: visit.patientId,
                departmentId: visit.departmentId,
                doctorId: visit.doctorId,
                scheduledAt: visit.scheduledAt.toISOString(),
                reason: visit.reason,
                diagnosis: visit.diagnosis,
                symptoms: visit.symptoms,
                notes: visit.notes,
                serviceIds: visit.services.map((s) => s.serviceId),
              }}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4 text-primary" /> Detajet klinike
              </CardTitle>
            </div>
            <Badge variant={statusVariant.variant}>{statusVariant.label}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row icon={<Calendar className="h-4 w-4" />} label="Data dhe ora">
              {formatDateTime(visit.scheduledAt)}
            </Row>
            <Row label="Mjeku">
              {visit.doctor ? `Dr. ${visit.doctor.firstName} ${visit.doctor.lastName}` : "—"}
            </Row>
            <Row label="Departamenti">{visit.department.nameSq}</Row>
            <Row label="Arsyeja">{visit.reason ?? "—"}</Row>
            <Row label="Simptomat" multiline>{visit.symptoms ?? "—"}</Row>
            <Row label="Diagnoza">{visit.diagnosis ?? "—"}</Row>
            <Row label="Trajtimi" multiline>{visit.treatment ?? "—"}</Row>
            <Row label="Shënime" multiline>{visit.notes ?? "—"}</Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" /> Financiare
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-semibold">{formatCurrency(Number(visit.totalAmount))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paguar</span>
              <span className="font-mono text-success">{formatCurrency(Number(visit.paidAmount))}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <span className="text-muted-foreground">Mbetet</span>
              <span className="font-mono font-bold text-destructive">
                {formatCurrency(Number(visit.totalAmount) - Number(visit.paidAmount))}
              </span>
            </div>
            {visit.invoice ? (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/billing/${visit.invoice.id}`}>Hap faturën</Link>
              </Button>
            ) : (
              <Button variant="premium" size="sm" className="w-full" asChild>
                <Link href={`/billing/new?visitId=${visit.id}&patientId=${visit.patientId}` as never}>
                  <Plus className="h-4 w-4" /> Krijo faturë
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-primary" /> Shërbimet
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 text-left">Kodi</th>
                <th className="px-4 py-2 text-left">Shërbimi</th>
                <th className="px-4 py-2 text-right">Sasia</th>
                <th className="px-4 py-2 text-right">Çmimi</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {visit.services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    Asnjë shërbim
                  </td>
                </tr>
              ) : (
                visit.services.map((vs) => (
                  <tr key={vs.id} className="border-b border-border/40 last:border-b-0">
                    <td className="px-4 py-2 font-mono text-xs">{vs.service.code}</td>
                    <td className="px-4 py-2">{vs.service.name}</td>
                    <td className="px-4 py-2 text-right">{vs.quantity}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(Number(vs.unitPrice))}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatCurrency(Number(vs.total))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {visit.labOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TestTube2 className="h-4 w-4 text-primary" /> Urdhrat laboratorikë
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {visit.labOrders.map((o) => (
              <Link
                key={o.id}
                href={`/lab/orders/${o.id}` as never}
                className="block rounded-lg border border-border/40 bg-card/40 px-3 py-2 hover:border-primary/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">{o.code}</span>
                  <Badge variant={o.status === "COMPLETED" ? "success" : "info"}>{o.status}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  children,
  multiline,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div className={`grid ${multiline ? "" : "grid-cols-3"} gap-2 text-sm`}>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`${multiline ? "mt-1 whitespace-pre-wrap" : "col-span-2"}`}>{children}</div>
    </div>
  );
}
