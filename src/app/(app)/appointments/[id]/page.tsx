import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Clock,
  User,
  Stethoscope,
} from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }> = {
  SCHEDULED: { label: "Planifikuar", variant: "secondary" },
  CONFIRMED: { label: "Konfirmuar", variant: "info" },
  ARRIVED: { label: "Mbërriti", variant: "warning" },
  IN_VISIT: { label: "Në vizitë", variant: "warning" },
  COMPLETED: { label: "Përfunduar", variant: "success" },
  CANCELLED: { label: "Anuluar", variant: "destructive" },
  NO_SHOW: { label: "Mungoi", variant: "destructive" },
};

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  const appt = await db.appointment.findUnique({
    where: { id },
    include: { patient: true, doctor: true },
  });
  if (!appt) notFound();

  const status = STATUS_LABELS[appt.status] ?? { label: appt.status, variant: "secondary" as const };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Termin ${appt.code}`}
        description={`${appt.patient.firstName} ${appt.patient.lastName} · ${formatDateTime(appt.scheduledAt)}`}
        breadcrumb={[
          { label: "Klinika" },
          { label: "Terminet", href: "/appointments" },
          { label: appt.code },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/appointments"><ArrowLeft className="h-4 w-4" /> Kthehu</Link>
            </Button>
            {appt.status === "SCHEDULED" && (
              <Button variant="info" size="sm"><CheckCircle2 className="h-4 w-4" /> Konfirmo</Button>
            )}
            {(appt.status === "CONFIRMED" || appt.status === "ARRIVED") && (
              <Button variant="success" size="sm" asChild>
                <Link href={`/visits/new?patientId=${appt.patient.id}&fromAppointment=${appt.id}`}>
                  <PlayCircle className="h-4 w-4" /> Krijo vizitë
                </Link>
              </Button>
            )}
            {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
              <Button variant="destructive" size="sm"><XCircle className="h-4 w-4" /> Anulo</Button>
            )}
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Detajet e terminit
            </span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row icon={<User className="h-4 w-4" />} label="Pacienti">
            <Link href={`/patients/${appt.patient.id}`} className="hover:text-primary">
              {appt.patient.firstName} {appt.patient.lastName}
            </Link>
            {appt.patient.phone && <span className="text-muted-foreground"> · {appt.patient.phone}</span>}
          </Row>
          <Row icon={<Stethoscope className="h-4 w-4" />} label="Mjeku">
            Dr. {appt.doctor.firstName} {appt.doctor.lastName}
          </Row>
          <Row icon={<Clock className="h-4 w-4" />} label="Data dhe ora">
            {formatDateTime(appt.scheduledAt)} ({appt.durationMin} min)
          </Row>
          <Row label="Arsyeja" multiline>{appt.reason ?? "—"}</Row>
          <Row label="Shënime" multiline>{appt.notes ?? "—"}</Row>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ icon, label, children, multiline }: { icon?: React.ReactNode; label: string; children: React.ReactNode; multiline?: boolean }) {
  return (
    <div className={`grid ${multiline ? "" : "grid-cols-3"} gap-2`}>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={multiline ? "mt-1" : "col-span-2"}>{children}</div>
    </div>
  );
}
