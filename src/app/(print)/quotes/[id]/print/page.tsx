import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintToolbar } from "../../../print-toolbar";

export const dynamic = "force-dynamic";

export default async function QuotePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!quote) notFound();

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 32, color: "#0F172A" }}>
      <PrintToolbar backHref={`/quotes/${id}`} />

      <div style={{ borderBottom: "2px solid #10B981", paddingBottom: 16, marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>SISH — Ofertë</div>
          <div style={{ fontSize: 11, color: "#64748B" }}>Klinika Demo SISH · Prishtinë</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>{quote.code}</div>
          <div style={{ fontSize: 11, color: "#64748B" }}>Vlefshme: {formatDate(quote.validFrom)} — {formatDate(quote.validUntil)}</div>
        </div>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{quote.title}</h1>
      {quote.patientName && (
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}>
          Për: <strong>{quote.patientName}</strong>
          {quote.patientPhone && ` · ${quote.patientPhone}`}
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 24 }}>
        <thead>
          <tr style={{ background: "#F1F5F9", borderBottom: "1px solid #CBD5E1" }}>
            <th style={{ textAlign: "left", padding: 10, width: 30 }}>#</th>
            <th style={{ textAlign: "left", padding: 10 }}>Përshkrimi</th>
            <th style={{ textAlign: "right", padding: 10, width: 60 }}>Sasia</th>
            <th style={{ textAlign: "right", padding: 10, width: 90 }}>Çmimi</th>
            <th style={{ textAlign: "right", padding: 10, width: 80 }}>Zbritje</th>
            <th style={{ textAlign: "right", padding: 10, width: 90 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {quote.items.map((it, i) => (
            <tr key={it.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
              <td style={{ padding: 10, color: "#94A3B8" }}>{i + 1}</td>
              <td style={{ padding: 10 }}>{it.description}</td>
              <td style={{ padding: 10, textAlign: "right" }}>{it.quantity}</td>
              <td style={{ padding: 10, textAlign: "right", fontFamily: "monospace" }}>{formatCurrency(Number(it.unitPrice))}</td>
              <td style={{ padding: 10, textAlign: "right", fontFamily: "monospace" }}>{formatCurrency(Number(it.discount))}</td>
              <td style={{ padding: 10, textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>{formatCurrency(Number(it.total))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <div style={{ width: 280, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>Subtotal</span><span style={{ fontFamily: "monospace" }}>{formatCurrency(Number(quote.subtotal))}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>TVSH</span><span style={{ fontFamily: "monospace" }}>{formatCurrency(Number(quote.vat))}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>Zbritje</span><span style={{ fontFamily: "monospace" }}>−{formatCurrency(Number(quote.discount))}</span></div>
          <div style={{ borderTop: "2px solid #10B981", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
            <span>TOTAL</span>
            <span style={{ fontFamily: "monospace", color: "#10B981" }}>{formatCurrency(Number(quote.total))}</span>
          </div>
        </div>
      </div>

      {quote.termsAndConditions && (
        <div style={{ fontSize: 10, color: "#475569", padding: 12, background: "#F8FAFC", borderRadius: 6, whiteSpace: "pre-wrap" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Termat & kushtet:</div>
          {quote.termsAndConditions}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, fontSize: 11 }}>
        <div>
          <div style={{ borderTop: "1px solid #475569", paddingTop: 4, width: 200 }}>Klinika SISH</div>
        </div>
        <div>
          <div style={{ borderTop: "1px solid #475569", paddingTop: 4, width: 200 }}>Pacienti / nënshkrimi</div>
        </div>
      </div>
    </div>
  );
}
