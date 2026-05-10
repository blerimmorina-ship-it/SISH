import Link from "next/link";
import { Plus, ScanLine, Building2, ClipboardCheck, Calendar as CalendarIcon } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Operacionet" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }> = {
  SCHEDULED: { label: "Planifikuar", variant: "info" },
  IN_PROGRESS: { label: "Në proces", variant: "warning" },
  COMPLETED: { label: "Përfunduar", variant: "success" },
  CANCELLED: { label: "Anuluar", variant: "destructive" },
};

export default async function OperationsPage() {
  const db = await getDb();
  const [rooms, surgeries] = await Promise.all([
    db.operatingRoom.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.surgery.findMany({
      take: 30,
      orderBy: { scheduledAt: "desc" },
      include: { room: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operacionet"
        description="Planifikimi i operacioneve dhe sallat e operacionit"
        breadcrumb={[{ label: "Klinika" }, { label: "Operacionet" }]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/operations/calendar"><CalendarIcon className="h-4 w-4" /> Kalendar</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/operations/rooms"><Building2 className="h-4 w-4" /> Sallat</Link>
            </Button>
            <Button variant="premium" size="sm">
              <Plus className="h-4 w-4" /> Operacion i ri
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" /> Sallat e Operacionit
            </CardTitle>
            <CardDescription>{rooms.length} salla aktive</CardDescription>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? (
              <EmptyState icon={Building2} title="Asnjë sallë e konfiguruar" description="Shto sallat për të planifikuar operacione." />
            ) : (
              <ul className="space-y-2">
                {rooms.map((r) => (
                  <li key={r.id} className="rounded-lg border border-border/40 bg-card/40 p-3">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Kodi: {r.code} · Kapacitet: {r.capacity}
                    </div>
                    {r.equipment && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">{r.equipment}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ScanLine className="h-4 w-4 text-primary" /> Operacionet e fundit
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {surgeries.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={ClipboardCheck} title="Asnjë operacion akoma" />
              </div>
            ) : (
              <ul className="divide-y divide-border/40">
                {surgeries.map((s) => {
                  const lab = STATUS_LABELS[s.status] ?? { label: s.status, variant: "secondary" as const };
                  return (
                    <li key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/5">
                      <div>
                        <div className="font-medium">{s.procedure}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.room.name} · {s.durationMin} min
                          {s.anesthesiaType ? ` · ${s.anesthesiaType}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={lab.variant}>{lab.label}</Badge>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          {formatDateTime(s.scheduledAt)}
                        </div>
                      </div>
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
