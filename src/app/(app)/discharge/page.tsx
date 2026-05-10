import Link from "next/link";
import { Plus, FileText, Filter } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Fletëlëshimet" };
export const dynamic = "force-dynamic";

export default async function DischargePage() {
  const db = await getDb();
  const sheets = await db.dischargeSheet.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fletëlëshimet"
        description="Fletë-lëshimet e pacientëve me diagnozat dhe rekomandimet"
        breadcrumb={[{ label: "Klinika" }, { label: "Fletëlëshimet" }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Filtro
            </Button>
            <Button variant="premium" size="sm" asChild>
              <Link href="/discharge/new">
                <Plus className="h-4 w-4" /> Fletëlëshim i ri
              </Link>
            </Button>
          </>
        }
      />

      {sheets.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={FileText}
              title="Asnjë fletëlëshim akoma"
              description="Krijo fletë-lëshimin e parë për një pacient pas trajtimit."
              action={
                <Button variant="premium" size="sm" asChild>
                  <Link href="/discharge/new">
                    <Plus className="h-4 w-4" /> Fletëlëshim i ri
                  </Link>
                </Button>
              }
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
                    <th className="px-4 py-3">Numri</th>
                    <th className="px-4 py-3">Pranuar</th>
                    <th className="px-4 py-3">Lëshuar</th>
                    <th className="px-4 py-3">Diagnoza</th>
                    <th className="px-4 py-3">Vizita kontrolluese</th>
                    <th className="px-4 py-3">Nënshkruar</th>
                    <th className="px-4 py-3 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {sheets.map((s) => (
                    <tr key={s.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                      <td className="px-4 py-3 font-mono text-xs">{s.number}</td>
                      <td className="px-4 py-3 text-xs">{formatDateTime(s.admittedAt)}</td>
                      <td className="px-4 py-3 text-xs">
                        {s.dischargedAt ? formatDateTime(s.dischargedAt) : "—"}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate">{s.primaryDiagnosis}</td>
                      <td className="px-4 py-3 text-xs">
                        {s.followUpDate ? formatDate(s.followUpDate) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {s.signedAt ? <Badge variant="success">Po</Badge> : <Badge variant="warning">Jo</Badge>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/discharge/${s.id}`}>Hap →</Link>
                        </Button>
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
