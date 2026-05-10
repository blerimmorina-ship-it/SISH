import Link from "next/link";
import { Plus, TestTube2, Clock, CheckCircle2, AlertOctagon, Filter } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "Urdhrat Laboratorikë" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "info" | "warning" | "success" | "destructive" | "secondary" }> = {
  REQUESTED: { label: "I kërkuar", variant: "secondary" },
  SAMPLE_TAKEN: { label: "Mostër e marrë", variant: "info" },
  IN_PROGRESS: { label: "Në proces", variant: "warning" },
  COMPLETED: { label: "Përfunduar", variant: "success" },
  CANCELLED: { label: "Anuluar", variant: "destructive" },
  REJECTED: { label: "Refuzuar", variant: "destructive" },
};

export default async function LabOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const db = await getDb();
  const params = await searchParams;
  const status = params.status?.toUpperCase();

  const [orders, counts] = await Promise.all([
    db.labOrder.findMany({
      take: 50,
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        patient: true,
        department: true,
        requestedBy: true,
        results: { include: { parameter: true } },
      },
    }),
    db.labOrder.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  function countOf(s: string): number {
    return counts.find((c) => c.status === s)?._count._all ?? 0;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Urdhrat Laboratorikë"
        description="Menaxho kërkesat, mostrat dhe rezultatet e analizave."
        breadcrumb={[{ label: "Laboratori" }, { label: "Urdhrat" }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Filtro
            </Button>
            <Button variant="premium" size="sm" asChild>
              <Link href="/lab/orders/new">
                <Plus className="h-4 w-4" /> Urdhër i ri
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Të kërkuara"
          value={countOf("REQUESTED")}
          icon={Clock}
          tone="info"
        />
        <StatCard
          label="Në proces"
          value={countOf("IN_PROGRESS") + countOf("SAMPLE_TAKEN")}
          icon={TestTube2}
          tone="warning"
        />
        <StatCard
          label="Përfunduar"
          value={countOf("COMPLETED")}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Refuzuar"
          value={countOf("REJECTED") + countOf("CANCELLED")}
          icon={AlertOctagon}
          tone="destructive"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={TestTube2}
                title="Asnjë urdhër laboratorik"
                description="Krijo urdhrin e parë për të filluar."
                action={
                  <Button variant="premium" size="sm" asChild>
                    <Link href="/lab/orders/new">
                      <Plus className="h-4 w-4" /> Urdhër i ri
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
                    <th className="px-4 py-3">Parametrat</th>
                    <th className="px-4 py-3">Statusi</th>
                    <th className="px-4 py-3">Krijuar</th>
                    <th className="px-4 py-3 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const s = STATUS_LABELS[o.status] ?? { label: o.status, variant: "secondary" as const };
                    return (
                      <tr
                        key={o.id}
                        className="border-b border-border/40 last:border-b-0 hover:bg-accent/5 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs">{o.code}</td>
                        <td className="px-4 py-3">
                          <Link href={`/patients/${o.patient.id}`} className="hover:text-primary">
                            {o.patient.firstName} {o.patient.lastName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{o.department.nameSq}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{o.results.length} parametra</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={s.variant}>{s.label}</Badge>
                          {o.priority === "urgent" && (
                            <Badge variant="warning" className="ml-1.5">Urgjent</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDateTime(o.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/lab/orders/${o.id}`}>Hap →</Link>
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
