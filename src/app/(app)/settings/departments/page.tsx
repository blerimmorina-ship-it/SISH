import { Plus, Building, Users, Edit, Trash2 } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Departamentet" };
export const dynamic = "force-dynamic";

export default async function DepartmentsSettingsPage() {
  const db = await getDb();
  const departments = await db.department.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { users: true, visits: true, services: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departamentet"
        description="Specialitetet mjekësore dhe departamentet e klinikës"
        actions={<Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Departament i ri</Button>}
      />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Emri</th>
                <th className="px-4 py-3">Kodi</th>
                <th className="px-4 py-3">Stafi</th>
                <th className="px-4 py-3">Vizitat</th>
                <th className="px-4 py-3">Shërbimet</th>
                <th className="px-4 py-3">Statusi</th>
                <th className="px-4 py-3 text-right">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: d.color ?? "#6366F1" }} />
                      <span className="font-medium">{d.nameSq}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{d.code}</td>
                  <td className="px-4 py-3"><Badge variant="outline"><Users className="h-3 w-3" /> {d._count.users}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{d._count.visits}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d._count.services}</td>
                  <td className="px-4 py-3">{d.isActive ? <Badge variant="success">Aktiv</Badge> : <Badge variant="secondary">Joaktiv</Badge>}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
