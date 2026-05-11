import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileSignature,
  Printer,
  Calendar,
  User,
  Phone,
} from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuoteSendButton, QuoteApproveButton, QuoteRejectButton } from "./status-actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }> = {
  DRAFT: { label: "Skicë", variant: "secondary" },
  SENT: { label: "Dërguar", variant: "info" },
  APPROVED: { label: "Aprovuar", variant: "success" },
  REJECTED: { label: "Refuzuar", variant: "destructive" },
  EXPIRED: { label: "Skaduar", variant: "warning" },
  CONVERTED: { label: "Konvertuar", variant: "success" },
};

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  const quote = await db.quote.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!quote) notFound();

  const status = STATUS_LABELS[quote.status] ?? { label: quote.status, variant: "secondary" as const };
  const isExpired = new Date(quote.validUntil) < new Date() && quote.status !== "APPROVED" && quote.status !== "CONVERTED";

  return (
    <div className="space-y-6">
      <PageHeader
        title={quote.title}
        description={`${quote.code} · ${formatCurrency(Number(quote.total))}`}
        breadcrumb={[
          { label: "Financa" },
          { label: "Ofertat", href: "/quotes" },
          { label: quote.code },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/quotes"><ArrowLeft className="h-4 w-4" /> Kthehu</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/quotes/${quote.id}/print`}><Printer className="h-4 w-4" /> Printo</Link>
            </Button>
            {quote.status === "DRAFT" && <QuoteSendButton quoteId={quote.id} />}
            {quote.status === "SENT" && (
              <>
                <QuoteApproveButton quoteId={quote.id} />
                <QuoteRejectButton quoteId={quote.id} />
              </>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-primary" /> Detajet
              </span>
              <div className="flex items-center gap-2">
                {isExpired && <Badge variant="warning">E skaduar</Badge>}
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row icon={<User className="h-4 w-4" />} label="Pacienti / Prospekti">
              {quote.patientName ?? "—"}
            </Row>
            {quote.patientPhone && (
              <Row icon={<Phone className="h-4 w-4" />} label="Telefoni">
                {quote.patientPhone}
              </Row>
            )}
            <Row icon={<Calendar className="h-4 w-4" />} label="Vlefshme">
              {formatDate(quote.validFrom)} — {formatDate(quote.validUntil)}
            </Row>
            <Row label="Krijuar më">{formatDateTime(quote.createdAt)}</Row>
            {quote.approvedAt && <Row label="Aprovuar më">{formatDateTime(quote.approvedAt)}</Row>}
            {quote.signedAt && <Row label="Nënshkruar më">{formatDateTime(quote.signedAt)}</Row>}
            <Row label="Shënime" multiline>{quote.notes ?? "—"}</Row>
            {quote.termsAndConditions && (
              <Row label="Termat & kushtet" multiline>
                <span className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {quote.termsAndConditions}
                </span>
              </Row>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Përmbledhja</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatCurrency(Number(quote.subtotal))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">TVSH</span>
              <span className="font-mono">{formatCurrency(Number(quote.vat))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Zbritje</span>
              <span className="font-mono">−{formatCurrency(Number(quote.discount))}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-2">
              <span className="font-semibold">Total</span>
              <span className="font-mono text-2xl font-bold text-gradient">{formatCurrency(Number(quote.total))}</span>
            </div>
            {quote.status === "APPROVED" && (
              <Button variant="premium" size="sm" className="w-full mt-3" asChild>
                <Link href={`/billing/new?quoteId=${quote.id}`}>Konverto në faturë →</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Artikujt e ofertës</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Përshkrimi</th>
                <th className="px-4 py-2 text-right">Sasia</th>
                <th className="px-4 py-2 text-right">Çmimi</th>
                <th className="px-4 py-2 text-right">Zbritje</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((it, i) => (
                <tr key={it.id} className="border-b border-border/40 last:border-b-0">
                  <td className="px-4 py-2 text-xs text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-2">{it.description}</td>
                  <td className="px-4 py-2 text-right">{it.quantity}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCurrency(Number(it.unitPrice))}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCurrency(Number(it.discount))}</td>
                  <td className="px-4 py-2 text-right font-mono font-semibold">{formatCurrency(Number(it.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ icon, label, children, multiline }: { icon?: React.ReactNode; label: string; children: React.ReactNode; multiline?: boolean }) {
  return (
    <div className={`grid ${multiline ? "" : "grid-cols-3"} gap-2`}>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={multiline ? "mt-1" : "col-span-2"}>{children}</div>
    </div>
  );
}
