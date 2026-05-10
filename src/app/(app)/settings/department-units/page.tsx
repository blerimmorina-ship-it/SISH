import { Plus, Layers, Edit, Users } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Njësitë e departamenteve" };
export const dynamic = "force-dynamic";

// Sample sub-units that demonstrate the concept
const SAMPLE_UNITS: Record<string, { name: string; capacity: number; staff: number }[]> = {
  CARD: [
    { name: "Sallë konsultash 1", capacity: 1, staff: 2 },
    { name: "Sallë konsultash 2", capacity: 1, staff: 1 },
    { name: "EKG room", capacity: 1, staff: 1 },
    { name: "Echo room", capacity: 1, staff: 1 },
  ],
  GP: [
    { name: "Sallë konsultash 1", capacity: 1, staff: 2 },
    { name: "Sallë triazhi", capacity: 2, staff: 1 },
  ],
  DENT: [
    { name: "Karrige stomatologjike 1", capacity: 1, staff: 2 },
    { name: "Karrige stomatologjike 2", capacity: 1, staff: 1 },
    { name: "Sallë rëntgeni", capacity: 1, staff: 1 },
  ],
  BIO: [
    { name: "Stacion analiza biokimike", capacity: 4, staff: 2 },
    { name: "Stacion mostra", capacity: 1, staff: 1 },
  ],
};

export default async function DepartmentUnitsPage() {
  const db = await getDb();
  const departments = await db.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Njësitë e departamenteve"
        description="Sub-njësi (salla, karrige, stacione) brenda secilit departament — për planifikim dhe alokim resursesh"
        actions={<Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Njësi e re</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-primary" /> Çfarë janë njësitë?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/30 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
            Njësitë janë <strong className="text-foreground">sub-resurse</strong> brenda departamentit:
            sallë konsultash, karrige stomatologjike, stacion analize, etj. Përdoren për:
            <ul className="mt-2 ml-4 space-y-1 list-disc">
              <li>Planifikim i terminëve me alokim të saktë</li>
              <li>Shmangje të konflikteve të rezervimit</li>
              <li>Raporte të përdorimit (utilization rate)</li>
              <li>Shpërndarje optimale e stafit</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {departments.map((d) => {
          const units = SAMPLE_UNITS[d.code] ?? [];
          return (
            <Card key={d.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color ?? "#6366F1" }} />
                  <div>
                    <CardTitle className="text-base">{d.nameSq}</CardTitle>
                    <CardDescription className="font-mono text-xs">{d.code}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{units.length} njësi</Badge>
                  <Button variant="ghost" size="sm"><Plus className="h-3.5 w-3.5" /> Shto</Button>
                </div>
              </CardHeader>
              {units.length > 0 && (
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-border/40 bg-muted/20 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="px-5 py-2">Njësia</th>
                        <th className="px-4 py-2 text-center">Kapaciteti</th>
                        <th className="px-4 py-2 text-center">Stafi</th>
                        <th className="px-4 py-2 text-right">Veprime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((u) => (
                        <tr key={u.name} className="border-b border-border/30 last:border-b-0">
                          <td className="px-5 py-2 font-medium">{u.name}</td>
                          <td className="px-4 py-2 text-center">
                            <Badge variant="secondary">{u.capacity}</Badge>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <Badge variant="outline"><Users className="h-3 w-3" /> {u.staff}</Badge>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
