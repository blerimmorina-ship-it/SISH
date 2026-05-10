import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Rezultatet" };
export const dynamic = "force-dynamic";

const FLAG_TONE: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  NORMAL: "success",
  ABNORMAL: "warning",
  CRITICAL: "destructive",
  PENDING: "secondary",
};

export default async function ResultsPage() {
  const db = await getDb();
  const results = await db.labResult.findMany({
    take: 100,
    orderBy: { enteredAt: "desc" },
    include: {
      parameter: true,
      order: { include: { patient: true, department: true } },
      enteredBy: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rezultatet"
        description="Rezultatet më të fundit nga laboratori."
        breadcrumb={[{ label: "Laboratori" }, { label: "Rezultatet" }]}
      />

      {results.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={ScrollText}
              title="Asnjë rezultat akoma"
              description="Rezultatet do të shfaqen këtu pasi të futen nga laborantët."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Pacienti</th>
                    <th className="px-4 py-3">Parametri</th>
                    <th className="px-4 py-3">Vlera</th>
                    <th className="px-4 py-3">Diapazoni</th>
                    <th className="px-4 py-3">Statusi</th>
                    <th className="px-4 py-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                      <td className="px-4 py-3">
                        {r.order.patient.firstName} {r.order.patient.lastName}
                        <div className="text-xs text-muted-foreground">{r.order.code}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">{r.parameter.name}</td>
                      <td className="px-4 py-3 font-mono">
                        {r.value} <span className="text-muted-foreground text-xs">{r.unit ?? r.parameter.unit ?? ""}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {r.parameter.refRangeMin && r.parameter.refRangeMax
                          ? `${r.parameter.refRangeMin} – ${r.parameter.refRangeMax}`
                          : r.parameter.refRangeText ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={FLAG_TONE[r.flag]}>{r.flag}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {r.enteredAt ? formatDateTime(r.enteredAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
