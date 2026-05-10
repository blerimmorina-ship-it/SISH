import { Plus, Building, Users, Wrench } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Sallat e Operacionit" };
export const dynamic = "force-dynamic";

export default async function OperatingRoomsPage() {
  const db = await getDb();
  const rooms = await db.operatingRoom.findMany({
    orderBy: { name: "asc" },
    include: { surgeries: { where: { scheduledAt: { gte: new Date() } } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sallat e Operacionit"
        description="Menaxho lokacionet ku kryhen operacionet"
        breadcrumb={[
          { label: "Klinika" },
          { label: "Operacionet", href: "/operations" },
          { label: "Sallat" },
        ]}
        actions={<Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Sallë e re</Button>}
      />

      {rooms.length === 0 ? (
        <Card><CardContent className="p-12">
          <EmptyState
            icon={Building}
            title="Asnjë sallë e konfiguruar"
            description="Krijo sallat operative për të mund të planifikosh operacione."
          />
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <Card key={r.id} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  {r.isActive ? <Badge variant="success">Aktive</Badge> : <Badge variant="muted">Joaktive</Badge>}
                </div>
                <h3 className="font-semibold text-lg">{r.name}</h3>
                <div className="text-xs text-muted-foreground font-mono">{r.code}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-border/40 bg-card/40 p-2">
                    <div className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3" /> Kapaciteti</div>
                    <div className="font-bold mt-0.5">{r.capacity}</div>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-card/40 p-2">
                    <div className="text-muted-foreground">Operacione t'ardhshme</div>
                    <div className="font-bold mt-0.5">{r.surgeries.length}</div>
                  </div>
                </div>
                {r.equipment && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                    <Wrench className="h-3 w-3 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{r.equipment}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
