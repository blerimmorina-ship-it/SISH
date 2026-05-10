import { Plus, FileText, Edit, Trash2 } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Shërbimet & Çmimet" };
export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  CONSULTATION: "Konsulta",
  LAB_TEST: "Analizë lab",
  PROCEDURE: "Procedurë",
  IMAGING: "Imazheri",
  SURGERY: "Operacion",
  THERAPY: "Terapi",
  OTHER: "Tjetër",
};

export default async function ServicesSettingsPage() {
  const db = await getDb();
  const services = await db.service.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: { department: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shërbimet & Çmimet"
        description={`${services.length} shërbime në katalog`}
        actions={<Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Shërbim i ri</Button>}
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Kodi</th>
                  <th className="px-4 py-3">Emri</th>
                  <th className="px-4 py-3">Tipi</th>
                  <th className="px-4 py-3">Departamenti</th>
                  <th className="px-4 py-3">Kohëzgjatja</th>
                  <th className="px-4 py-3 text-right">Çmimi</th>
                  <th className="px-4 py-3 text-right">TVSH</th>
                  <th className="px-4 py-3">Statusi</th>
                  <th className="px-4 py-3 text-right">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                    <td className="px-4 py-3 font-mono text-xs">{s.code}</td>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{TYPE_LABELS[s.type] ?? s.type}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{s.department?.nameSq ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{s.duration ? `${s.duration} min` : "—"}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(Number(s.price))}</td>
                    <td className="px-4 py-3 text-right text-xs">{Number(s.vatRate)}%</td>
                    <td className="px-4 py-3">{s.isActive ? <Badge variant="success">Aktiv</Badge> : <Badge variant="muted">Joaktiv</Badge>}</td>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
