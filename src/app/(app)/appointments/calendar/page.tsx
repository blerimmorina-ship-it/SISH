import Link from "next/link";
import { List, Plus } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar/calendar-view";

export const metadata = { title: "Kalendar Termini" };
export const dynamic = "force-dynamic";

const COLORS_BY_STATUS: Record<string, string> = {
  SCHEDULED: "hsl(243 75% 65%)",  // primary indigo
  CONFIRMED: "hsl(160 84% 45%)",  // accent emerald
  ARRIVED: "hsl(38 92% 55%)",     // warning amber
  IN_VISIT: "hsl(199 89% 55%)",   // info sky
  COMPLETED: "hsl(142 71% 50%)",  // success green
  CANCELLED: "hsl(0 70% 60%)",    // destructive red
  NO_SHOW: "hsl(0 70% 50%)",      // destructive darker
};

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Planifikuar",
  CONFIRMED: "Konfirmuar",
  ARRIVED: "Mbërriti",
  IN_VISIT: "Në vizitë",
  COMPLETED: "Përfunduar",
  CANCELLED: "Anuluar",
  NO_SHOW: "Mungoi",
};

export default async function AppointmentsCalendarPage() {
  const db = await getDb();
  // Fetch a 60-day window centered on today
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const end = new Date();
  end.setDate(end.getDate() + 30);

  const appointments = await db.appointment.findMany({
    where: { scheduledAt: { gte: start, lte: end } },
    include: { patient: true, doctor: true },
    orderBy: { scheduledAt: "asc" },
  });

  const events = appointments.map((a) => {
    const startDate = new Date(a.scheduledAt);
    const endDate = new Date(startDate.getTime() + a.durationMin * 60000);
    return {
      id: a.id,
      title: `${a.patient.firstName} ${a.patient.lastName}`,
      subtitle: `Dr. ${a.doctor.firstName} ${a.doctor.lastName}${a.reason ? ` · ${a.reason}` : ""}`,
      start: startDate,
      end: endDate,
      color: COLORS_BY_STATUS[a.status] ?? "hsl(243 75% 65%)",
      href: `/appointments/${a.id}`,
      badge: STATUS_LABEL[a.status],
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalendar i terminëve"
        description={`${appointments.length} termine në 60 ditë (30 prapa + 30 para)`}
        breadcrumb={[
          { label: "Klinika" },
          { label: "Terminet", href: "/appointments" },
          { label: "Kalendar" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/appointments"><List className="h-4 w-4" /> Pamja list</Link>
            </Button>
            <Button variant="premium" size="sm" asChild>
              <Link href="/appointments/new"><Plus className="h-4 w-4" /> Termin i ri</Link>
            </Button>
          </>
        }
      />

      <CalendarView
        events={events}
        initialView="week"
        startHour={8}
        endHour={20}
        newEventHref="/appointments/new"
      />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted-foreground">Legjenda:</span>
        {Object.entries(STATUS_LABEL).map(([s, label]) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: COLORS_BY_STATUS[s] }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
