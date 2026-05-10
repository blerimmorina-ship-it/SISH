import Link from "next/link";
import { List, Plus, Building } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar/calendar-view";

export const metadata = { title: "Kalendar Operacionesh" };
export const dynamic = "force-dynamic";

// Color palette for operating rooms
const ROOM_COLORS = [
  "hsl(243 75% 65%)",  // indigo
  "hsl(160 84% 45%)",  // emerald
  "hsl(38 92% 55%)",   // amber
  "hsl(199 89% 55%)",  // sky
  "hsl(280 80% 65%)",  // purple
  "hsl(340 80% 60%)",  // rose
];

export default async function OperationsCalendarPage() {
  const db = await getDb();
  const start = new Date();
  start.setDate(start.getDate() - 14);
  const end = new Date();
  end.setDate(end.getDate() + 30);

  const [rooms, surgeries] = await Promise.all([
    db.operatingRoom.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
    db.surgery.findMany({
      where: { scheduledAt: { gte: start, lte: end } },
      include: { room: true },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  const columns = rooms.map((r, i) => ({
    id: r.id,
    label: r.name,
    color: ROOM_COLORS[i % ROOM_COLORS.length],
  }));

  const events = surgeries.map((s) => {
    const roomIndex = rooms.findIndex((r) => r.id === s.roomId);
    const startDate = new Date(s.scheduledAt);
    const endDate = new Date(startDate.getTime() + s.durationMin * 60000);
    return {
      id: s.id,
      title: s.procedure,
      subtitle: s.anesthesiaType ?? "—",
      start: startDate,
      end: endDate,
      color: ROOM_COLORS[roomIndex % ROOM_COLORS.length],
      groupId: s.roomId,
      href: `/operations/${s.id}`,
      badge: s.status,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalendar i operacioneve"
        description={`${surgeries.length} operacione në ${rooms.length} salla operative`}
        breadcrumb={[
          { label: "Klinika" },
          { label: "Operacionet", href: "/operations" },
          { label: "Kalendar" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/operations"><List className="h-4 w-4" /> Pamja list</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/operations/rooms"><Building className="h-4 w-4" /> Sallat</Link>
            </Button>
            <Button variant="premium" size="sm">
              <Plus className="h-4 w-4" /> Operacion i ri
            </Button>
          </>
        }
      />

      {rooms.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/30 p-12 text-center">
          <Building className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            Asnjë sallë operative e konfiguruar. Krijo sallat e para për të mund të planifikosh operacione.
          </p>
          <Button variant="premium" size="sm" asChild>
            <Link href="/operations/rooms"><Plus className="h-4 w-4" /> Konfiguro sallat</Link>
          </Button>
        </div>
      ) : (
        <CalendarView
          events={events}
          columns={columns}
          initialView="day"
          startHour={7}
          endHour={20}
        />
      )}

      {/* Legend */}
      {rooms.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-muted-foreground">Sallat:</span>
          {columns.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
