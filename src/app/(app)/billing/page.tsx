import Link from "next/link";
import { Plus, Receipt, FileText, CreditCard } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "Faturimi" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }> = {
  DRAFT: { label: "Skicë", variant: "secondary" },
  ISSUED: { label: "E lëshuar", variant: "info" },
  PARTIALLY_PAID: { label: "Pjesërisht e paguar", variant: "warning" },
  PAID: { label: "E paguar", variant: "success" },
  CANCELLED: { label: "E anuluar", variant: "destructive" },
  REFUNDED: { label: "E rikthyer", variant: "destructive" },
};

export default async function BillingPage() {
  const db = await getDb();
  const [invoices, totalsAgg, paidAgg, dueAgg] = await Promise.all([
    db.invoice.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { patient: true, _count: { select: { items: true, payments: true } } },
    }),
    db.invoice.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    db.invoice.aggregate({
      _sum: { paidAmount: true },
    }),
    db.invoice.aggregate({
      _sum: { balance: true },
      where: { status: { in: ["ISSUED", "PARTIALLY_PAID"] } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faturimi"
        description="Faturat, pagesat dhe bilanci financiar"
        breadcrumb={[{ label: "Financa" }, { label: "Faturimi" }]}
        actions={
          <Button variant="premium" size="sm" asChild>
            <Link href="/billing/new">
              <Plus className="h-4 w-4" /> Faturë e re
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total i faturuar"
          value={formatCurrency(Number(totalsAgg._sum.total ?? 0))}
          icon={FileText}
          tone="primary"
        />
        <StatCard
          label="I arkëtuar"
          value={formatCurrency(Number(paidAgg._sum.paidAmount ?? 0))}
          icon={CreditCard}
          tone="success"
        />
        <StatCard
          label="Borxh i hapur"
          value={formatCurrency(Number(dueAgg._sum.balance ?? 0))}
          icon={Receipt}
          tone="warning"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Receipt}
                title="Asnjë faturë akoma"
                description="Faturat shfaqen këtu pasi t'i lëshosh."
                action={
                  <Button variant="premium" size="sm" asChild>
                    <Link href="/billing/new">
                      <Plus className="h-4 w-4" /> Faturë e re
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
                    <th className="px-4 py-3">Numri</th>
                    <th className="px-4 py-3">Pacienti</th>
                    <th className="px-4 py-3">Lëshuar</th>
                    <th className="px-4 py-3">Statusi</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Paguar</th>
                    <th className="px-4 py-3 text-right">Borxhi</th>
                    <th className="px-4 py-3 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const s = STATUS_LABELS[inv.status] ?? { label: inv.status, variant: "secondary" as const };
                    return (
                      <tr key={inv.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                        <td className="px-4 py-3 font-mono text-xs">{inv.number}</td>
                        <td className="px-4 py-3">
                          <Link href={`/patients/${inv.patient.id}`} className="hover:text-primary">
                            {inv.patient.firstName} {inv.patient.lastName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {inv.issuedAt ? formatDate(inv.issuedAt) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatCurrency(Number(inv.total))}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-success">
                          {formatCurrency(Number(inv.paidAmount))}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={Number(inv.balance) > 0 ? "text-destructive" : "text-muted-foreground"}>
                            {formatCurrency(Number(inv.balance))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/billing/${inv.id}`}>Hap →</Link>
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
