import Link from "next/link";
import { Plus, Stethoscope, Filter } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Vizitat" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; variant: "info" | "warning" | "success" | "destructive" | "secondary" }> = {
  PENDING: { label: "Në pritje", variant: "secondary" },
  IN_PROGRESS: { label: "Në proces", variant: "info" },
  COMPLETED: { label: "Përfunduar", variant: "success" },
  CANCELLED: { label: "Anuluar", variant: "destructive" },
  NO_SHOW: { label: "Mungoi", variant: "warning" },
};

export default async function VisitsPage() {
  const db = await getDb();
  const visits = await db.visit.findMany({
    take: 50,
    orderBy: { scheduledAt: "desc" },
    include: { patient: true, doctor: true, department: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vizitat"
        description="Të gjitha vizitat dhe konsultat e klinikës"
        breadcrumb={[{ label: "Klinika" }, { label: "Vizitat" }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Filtro
            </Button>
            <Button variant="premium" size="sm" asChild>
              <Link href="/visits/new">
                <Plus className="h-4 w-4" /> Vizitë e re
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          {visits.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Stethoscope}
                title="Asnjë vizitë akoma"
                description="Krijo vizitën e parë për të filluar."
                action={
                  <Button variant="premium" size="sm" asChild>
                    <Link href="/visits/new">
                      <Plus className="h-4 w-4" /> Vizitë e re
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Kodi</th>
                    <th className="px-4 py-3">Pacienti</th>
                    <th className="px-4 py-3">Departamenti</th>
                    <th className="px-4 py-3">Mjeku</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Statusi</th>
                    <th className="px-4 py-3 text-right">Shuma</th>
                    <th className="px-4 py-3 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => {
                    const s = STATUS_LABELS[v.status] ?? { label: v.status, variant: "secondary" as const };
                    return (
                      <tr key={v.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                        <td className="px-4 py-3 font-mono text-xs">{v.code}</td>
                        <td className="px-4 py-3">
                          <Link href={`/patients/${v.patient.id}`} className="hover:text-primary">
                            {v.patient.firstName} {v.patient.lastName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{v.department.nameSq}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {v.doctor ? `${v.doctor.firstName} ${v.doctor.lastName}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs">{formatDateTime(v.scheduledAt)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatCurrency(Number(v.totalAmount))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/visits/${v.id}`}>Hap →</Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
