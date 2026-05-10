import Link from "next/link";
import { Plus, CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Terminet" };
export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const db = await getDb();
  const appointments = await db.appointment.findMany({
    take: 100,
    orderBy: { scheduledAt: "asc" },
    where: { scheduledAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    include: { patient: true, doctor: true },
  });

  // Group by day
  const grouped = appointments.reduce<Record<string, typeof appointments>>((acc, a) => {
    const key = formatDate(a.scheduledAt);
    (acc[key] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Terminet"
        description="Kalendari i takimeve të planifikuara"
        breadcrumb={[{ label: "Klinika" }, { label: "Terminet" }]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/appointments/calendar">
                <CalendarIcon className="h-4 w-4" /> Kalendar
              </Link>
            </Button>
            <Button variant="premium" size="sm" asChild>
              <Link href="/appointments/new">
                <Plus className="h-4 w-4" /> Termin i ri
              </Link>
            </Button>
          </>
        }
      />

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={CalendarDays}
              title="Asnjë termin i planifikuar"
              description="Termini i parë do të shfaqet këtu kur ta krijosh."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([day, items]) => (
            <Card key={day}>
              <CardContent className="p-0">
                <div className="border-b border-border/60 bg-muted/30 px-5 py-3 flex items-center justify-between">
                  <h3 className="font-semibold">{day}</h3>
                  <Badge variant="outline">{items.length} termine</Badge>
                </div>
                <ul className="divide-y divide-border/40">
                  {items.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-accent/5 transition-colors"
                    >
                      <div className="w-20 shrink-0">
                        <div className="text-lg font-bold tracking-tight">
                          {new Date(a.scheduledAt).toLocaleTimeString("sq-AL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{a.durationMin} min</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">
                          {a.patient.firstName} {a.patient.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Dr. {a.doctor.firstName} {a.doctor.lastName}
                          {a.reason ? ` · ${a.reason}` : ""}
                        </div>
                      </div>
                      <Badge
                        variant={
                          a.status === "CONFIRMED"
                            ? "success"
                            : a.status === "CANCELLED" || a.status === "NO_SHOW"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {a.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
