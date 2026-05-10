import Link from "next/link";
import { Plus, FileSignature, Filter, Clock, CheckCircle2, XCircle, Send } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "Ofertat (Quotes)" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }> = {
  DRAFT: { label: "Skicë", variant: "secondary" },
  SENT: { label: "Dërguar", variant: "info" },
  APPROVED: { label: "Aprovuar", variant: "success" },
  REJECTED: { label: "Refuzuar", variant: "destructive" },
  EXPIRED: { label: "Skadoi", variant: "warning" },
  CONVERTED: { label: "Konvertuar në faturë", variant: "success" },
};

export default async function QuotesPage() {
  const db = await getDb();
  const [quotes, counts] = await Promise.all([
    db.quote.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
    db.quote.groupBy({
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
        title="Ofertat"
        description="Oferta për pacientë me workflow aprovimi dhe nënshkrimi"
        breadcrumb={[{ label: "Financa" }, { label: "Ofertat" }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Filtro
            </Button>
            <Button variant="premium" size="sm" asChild>
              <Link href="/quotes/new">
                <Plus className="h-4 w-4" /> Ofertë e re
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Skica" value={countOf("DRAFT")} icon={Clock} tone="info" />
        <StatCard label="Dërguar" value={countOf("SENT")} icon={Send} tone="primary" />
        <StatCard label="Aprovuar" value={countOf("APPROVED")} icon={CheckCircle2} tone="success" />
        <StatCard label="Refuzuar" value={countOf("REJECTED")} icon={XCircle} tone="destructive" />
        <StatCard label="Skaduar" value={countOf("EXPIRED")} icon={Clock} tone="warning" />
      </div>

      <Card>
        <CardContent className="p-0">
          {quotes.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={FileSignature}
                title="Asnjë ofertë akoma"
                description="Krijo ofertën e parë dhe dërgoje pacientit për aprovim."
                action={
                  <Button variant="premium" size="sm" asChild>
                    <Link href="/quotes/new">
                      <Plus className="h-4 w-4" /> Ofertë e re
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
                    <th className="px-4 py-3">Titulli</th>
                    <th className="px-4 py-3">Pacienti</th>
                    <th className="px-4 py-3">Vlefshmëria</th>
                    <th className="px-4 py-3">Statusi</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Nënshkruar</th>
                    <th className="px-4 py-3 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => {
                    const s = STATUS_LABELS[q.status] ?? { label: q.status, variant: "secondary" as const };
                    return (
                      <tr key={q.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                        <td className="px-4 py-3 font-mono text-xs">{q.code}</td>
                        <td className="px-4 py-3 font-medium">{q.title}</td>
                        <td className="px-4 py-3">{q.patientName ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDate(q.validFrom)} – {formatDate(q.validUntil)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(Number(q.total))}</td>
                        <td className="px-4 py-3">
                          {q.signedAt ? (
                            <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Po</Badge>
                          ) : (
                            <Badge variant="secondary">Jo</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/quotes/${q.id}`}>Hap →</Link>
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
