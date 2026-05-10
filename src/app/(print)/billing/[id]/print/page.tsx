import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintToolbar } from "../../../print-toolbar";

export const dynamic = "force-dynamic";

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { patient: true, items: true, payments: true, issuedBy: true },
  });
  if (!invoice) notFound();

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 32, color: "#0F172A" }}>
      <PrintToolbar backHref={`/billing/${id}`} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", borderBottom: "2px solid #6366F1", paddingBottom: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "linear-gradient(135deg, #6366F1, #10B981)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 16 }}>+</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>SISH</div>
              <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 2 }}>Health · Cloud</div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
            Klinika Demo SISH<br />
            Prishtinë, Kosovë<br />
            +383 38 000 000<br />
            info@klinika.com
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0F172A" }}>FATURË</div>
          <div style={{ fontSize: 13, fontFamily: "monospace", color: "#475569", marginTop: 4 }}>{invoice.number}</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 12 }}>
            <div><strong>Data:</strong> {invoice.issuedAt ? formatDate(invoice.issuedAt) : formatDate(invoice.createdAt)}</div>
            {invoice.dueDate && <div><strong>Afati:</strong> {formatDate(invoice.dueDate)}</div>}
          </div>
        </div>
      </div>

      {/* Bill to */}
      <div style={{ marginBottom: 24, fontSize: 12 }}>
        <div style={{ color: "#64748B", textTransform: "uppercase", letterSpacing: 1, fontSize: 10, marginBottom: 6 }}>Faturuar për</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{invoice.patient.firstName} {invoice.patient.lastName}</div>
        <div style={{ color: "#475569" }}>
          {invoice.patient.code}
          {invoice.patient.phone && ` · ${invoice.patient.phone}`}
          {invoice.patient.address && <><br />{invoice.patient.address}{invoice.patient.city ? `, ${invoice.patient.city}` : ""}</>}
        </div>
      </div>

      {/* Items */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 24 }}>
        <thead>
          <tr style={{ background: "#F1F5F9", borderBottom: "1px solid #CBD5E1" }}>
            <th style={{ textAlign: "left", padding: 10, fontWeight: 600 }}>Përshkrimi</th>
            <th style={{ textAlign: "right", padding: 10, fontWeight: 600, width: 60 }}>Sasia</th>
            <th style={{ textAlign: "right", padding: 10, fontWeight: 600, width: 90 }}>Çmimi</th>
            <th style={{ textAlign: "right", padding: 10, fontWeight: 600, width: 80 }}>Zbritje</th>
            <th style={{ textAlign: "right", padding: 10, fontWeight: 600, width: 60 }}>TVSH</th>
            <th style={{ textAlign: "right", padding: 10, fontWeight: 600, width: 90 }}>Totali</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it) => (
            <tr key={it.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
              <td style={{ padding: 10 }}>{it.description}</td>
              <td style={{ padding: 10, textAlign: "right" }}>{it.quantity}</td>
              <td style={{ padding: 10, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(Number(it.unitPrice))}</td>
              <td style={{ padding: 10, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(Number(it.discount))}</td>
              <td style={{ padding: 10, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(Number(it.vat))}</td>
              <td style={{ padding: 10, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{formatCurrency(Number(it.total))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <div style={{ width: 280, fontSize: 12 }}>
          <Row label="Subtotal" value={formatCurrency(Number(invoice.subtotal))} />
          <Row label="TVSH" value={formatCurrency(Number(invoice.vat))} />
          <Row label="Zbritje" value={`−${formatCurrency(Number(invoice.discount))}`} />
          <div style={{ borderTop: "2px solid #0F172A", marginTop: 8, paddingTop: 8 }}>
            <Row label="TOTAL" value={formatCurrency(Number(invoice.total))} bold large />
          </div>
          <Row label="Paguar" value={formatCurrency(Number(invoice.paidAmount))} muted />
          <Row label="Mbetet" value={formatCurrency(Number(invoice.total) - Number(invoice.paidAmount))} bold />
        </div>
      </div>

      {/* Payments */}
      {invoice.payments.length > 0 && (
        <div style={{ fontSize: 11, color: "#475569", marginBottom: 24 }}>
          <div style={{ textTransform: "uppercase", letterSpacing: 1, fontSize: 10, color: "#64748B", marginBottom: 4 }}>Pagesat</div>
          {invoice.payments.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed #E2E8F0" }}>
              <span>{formatDate(p.paidAt)} · {p.method}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(Number(p.amount))}</span>
            </div>
          ))}
        </div>
      )}

      {invoice.notes && (
        <div style={{ fontSize: 11, padding: 12, background: "#F8FAFC", borderLeft: "3px solid #6366F1", marginBottom: 24, whiteSpace: "pre-wrap" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Shënime:</div>
          {invoice.notes}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid #CBD5E1", paddingTop: 16, fontSize: 10, color: "#64748B", textAlign: "center" }}>
        Lëshuar nga {invoice.issuedBy.firstName} {invoice.issuedBy.lastName} · Krijuar nga SISH Health Cloud
        <br />
        Faleminderit për besimin tuaj!
      </div>
    </div>
  );
}

function Row({ label, value, bold, large, muted }: { label: string; value: string; bold?: boolean; large?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: muted ? "#64748B" : "inherit", fontSize: large ? 14 : 12, fontWeight: bold ? 700 : 400 }}>
      <span>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}
