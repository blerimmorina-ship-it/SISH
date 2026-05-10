import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Receipt,
  Printer,
  CreditCard,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentForm } from "./payment-form";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }> = {
  DRAFT: { label: "Skicë", variant: "secondary" },
  ISSUED: { label: "Lëshuar", variant: "info" },
  PARTIALLY_PAID: { label: "Pjesërisht e paguar", variant: "warning" },
  PAID: { label: "E paguar", variant: "success" },
  CANCELLED: { label: "Anuluar", variant: "destructive" },
  REFUNDED: { label: "Rikthyer", variant: "destructive" },
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      patient: true,
      issuedBy: true,
      items: true,
      payments: true,
    },
  });
  if (!invoice) notFound();

  const status = STATUS_LABELS[invoice.status] ?? { label: invoice.status, variant: "secondary" as const };
  const balance = Number(invoice.total) - Number(invoice.paidAmount);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Faturë ${invoice.number}`}
        description={`${invoice.patient.firstName} ${invoice.patient.lastName} · ${formatCurrency(Number(invoice.total))}`}
        breadcrumb={[
          { label: "Financa" },
          { label: "Faturimi", href: "/billing" },
          { label: invoice.number },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/billing"><ArrowLeft className="h-4 w-4" /> Kthehu</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/billing/${invoice.id}/print` as never} target="_blank">
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
                <Receipt className="h-4 w-4 text-primary" /> Detajet
              </span>
              <Badge variant={status.variant}>{status.label}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Numri">{invoice.number}</Row>
            <Row label="Pacienti">{invoice.patient.firstName} {invoice.patient.lastName}</Row>
            <Row label="Lëshuar nga">{invoice.issuedBy.firstName} {invoice.issuedBy.lastName}</Row>
            <Row label="Lëshuar më">{invoice.issuedAt ? formatDateTime(invoice.issuedAt) : "—"}</Row>
            <Row label="Afati">
              {invoice.dueDate ? (
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(invoice.dueDate)}</span>
              ) : "—"}
            </Row>
            <Row label="Shënime" multiline>{invoice.notes ?? "—"}</Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Bilanci</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatCurrency(Number(invoice.subtotal))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">TVSH</span>
              <span className="font-mono">{formatCurrency(Number(invoice.vat))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Zbritje</span>
              <span className="font-mono">−{formatCurrency(Number(invoice.discount))}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-2 text-base">
              <span>Total</span>
              <span className="font-mono font-bold">{formatCurrency(Number(invoice.total))}</span>
            </div>
            <div className="flex items-center justify-between text-success">
              <span>Paguar</span>
              <span className="font-mono">{formatCurrency(Number(invoice.paidAmount))}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-2">
              <span className="font-semibold">Mbetet</span>
              <span className={`font-mono text-xl font-bold ${balance > 0 ? "text-destructive" : "text-foreground"}`}>
                {formatCurrency(balance)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-primary" /> Artikujt
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 text-left">Përshkrimi</th>
                <th className="px-4 py-2 text-right">Sasia</th>
                <th className="px-4 py-2 text-right">Çmimi</th>
                <th className="px-4 py-2 text-right">Zbritje</th>
                <th className="px-4 py-2 text-right">TVSH</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it) => (
                <tr key={it.id} className="border-b border-border/40 last:border-b-0">
                  <td className="px-4 py-2">{it.description}</td>
                  <td className="px-4 py-2 text-right">{it.quantity}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCurrency(Number(it.unitPrice))}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCurrency(Number(it.discount))}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCurrency(Number(it.vat))}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCurrency(Number(it.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {balance > 0 && invoice.status !== "CANCELLED" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-primary" /> Regjistro pagesë
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentForm invoiceId={invoice.id} maxAmount={balance} />
          </CardContent>
        </Card>
      )}

      {invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-success" /> Pagesat e regjistruara
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2 text-left">Data</th>
                  <th className="px-4 py-2 text-left">Metoda</th>
                  <th className="px-4 py-2 text-left">Reference</th>
                  <th className="px-4 py-2 text-right">Shuma</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 last:border-b-0">
                    <td className="px-4 py-2">{formatDateTime(p.paidAt)}</td>
                    <td className="px-4 py-2"><Badge variant="secondary">{p.method}</Badge></td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{p.reference ?? "—"}</td>
                    <td className="px-4 py-2 text-right font-mono text-success">{formatCurrency(Number(p.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
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
