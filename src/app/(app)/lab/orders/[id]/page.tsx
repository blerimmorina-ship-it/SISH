import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  TestTube2,
  Printer,
} from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResultsForm } from "./results-form";
import { LabOrderStatusActions } from "./status-actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }> = {
  REQUESTED: { label: "I kërkuar", variant: "secondary" },
  SAMPLE_TAKEN: { label: "Mostër marrë", variant: "info" },
  IN_PROGRESS: { label: "Në proces", variant: "warning" },
  COMPLETED: { label: "Përfunduar", variant: "success" },
  CANCELLED: { label: "Anuluar", variant: "destructive" },
  REJECTED: { label: "Refuzuar", variant: "destructive" },
};

export default async function LabOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  const order = await db.labOrder.findUnique({
    where: { id },
    include: {
      patient: true,
      department: true,
      requestedBy: true,
      results: { include: { parameter: { include: { template: { include: { service: true } } } } } },
    },
  });
  if (!order) notFound();

  const status = STATUS_LABELS[order.status] ?? { label: order.status, variant: "secondary" as const };

  // Group results by template
  const grouped = new Map<string, typeof order.results>();
  for (const r of order.results) {
    const key = r.parameter.template.service.name;
    const existing = grouped.get(key) ?? [];
    existing.push(r);
    grouped.set(key, existing);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Urdhër ${order.code}`}
        description={`${order.patient.firstName} ${order.patient.lastName} · ${order.department.nameSq}`}
        breadcrumb={[
          { label: "Laboratori" },
          { label: "Urdhrat", href: "/lab/orders" },
          { label: order.code },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/lab/orders"><ArrowLeft className="h-4 w-4" /> Kthehu</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/lab/orders/${order.id}/print` as never} target="_blank">
                <Printer className="h-4 w-4" /> Printo
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TestTube2 className="h-4 w-4 text-primary" /> Detajet
              </span>
              <Badge variant={status.variant}>{status.label}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Pacienti">{order.patient.firstName} {order.patient.lastName}</Row>
            <Row label="Departamenti">{order.department.nameSq}</Row>
            <Row label="Kërkuar nga">{order.requestedBy.firstName} {order.requestedBy.lastName}</Row>
            <Row label="Krijuar më">{formatDateTime(order.createdAt)}</Row>
            <Row label="Prioriteti">
              <Badge variant={order.priority === "stat" ? "destructive" : order.priority === "urgent" ? "warning" : "secondary"}>
                {order.priority.toUpperCase()}
              </Badge>
            </Row>
            <Row label="Mostra marrë">{order.sampleTakenAt ? formatDateTime(order.sampleTakenAt) : "—"}</Row>
            <Row label="Përfunduar">{order.completedAt ? formatDateTime(order.completedAt) : "—"}</Row>
            <Row label="Info klinike" multiline>{order.clinicalInfo ?? "—"}</Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Veprime të shpejta</CardTitle></CardHeader>
          <CardContent>
            <LabOrderStatusActions orderId={order.id} status={order.status} />
          </CardContent>
        </Card>
      </div>

      <ResultsForm orderId={order.id} groupedResults={Array.from(grouped.entries()).map(([name, results]) => ({
        templateName: name,
        results: results.map((r) => ({
          id: r.id,
          parameterId: r.parameter.id,
          name: r.parameter.name,
          unit: r.parameter.unit,
          refMin: r.parameter.refRangeMin ? Number(r.parameter.refRangeMin) : null,
          refMax: r.parameter.refRangeMax ? Number(r.parameter.refRangeMax) : null,
          refText: r.parameter.refRangeText,
          value: r.value,
          flag: r.flag,
        })),
      }))} />
    </div>
  );
}

function Row({ label, children, multiline }: { label: string; children: React.ReactNode; multiline?: boolean }) {
  return (
    <div className={`grid ${multiline ? "" : "grid-cols-3"} gap-2`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={multiline ? "mt-1" : "col-span-2"}>{children}</div>
    </div>
  );
}
