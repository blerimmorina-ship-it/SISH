import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDateTime, calculateAge } from "@/lib/utils";
import { PrintToolbar } from "../../../../print-toolbar";

export const dynamic = "force-dynamic";

export default async function LabResultPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.labOrder.findUnique({
    where: { id },
    include: {
      patient: true,
      department: true,
      requestedBy: true,
      results: { include: { parameter: { include: { template: { include: { service: true } } } } } },
    },
  });
  if (!order) notFound();

  const grouped = new Map<string, typeof order.results>();
  for (const r of order.results) {
    const key = r.parameter.template.service.name;
    (grouped.get(key) ?? (grouped.set(key, []), grouped.get(key)!)).push(r);
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 32, color: "#0F172A" }}>
      <PrintToolbar backHref={`/lab/orders/${id}`} />

      <div style={{ borderBottom: "2px solid #6366F1", paddingBottom: 16, marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>SISH — Raport Laboratorik</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{order.department.nameSq}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>{order.code}</div>
          <div style={{ fontSize: 11, color: "#64748B" }}>Krijuar: {formatDateTime(order.createdAt)}</div>
          {order.completedAt && <div style={{ fontSize: 11, color: "#10B981" }}>Përfunduar: {formatDateTime(order.completedAt)}</div>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24, fontSize: 11 }}>
        <div style={{ padding: 10, background: "#F8FAFC", borderRadius: 6 }}>
          <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Pacienti</div>
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{order.patient.firstName} {order.patient.lastName}</div>
          <div style={{ color: "#475569" }}>
            {order.patient.code}
            {order.patient.dateOfBirth && ` · ${calculateAge(order.patient.dateOfBirth)} vjeç`}
            {order.patient.gender !== "UNSPECIFIED" && ` · ${order.patient.gender === "MALE" ? "M" : "F"}`}
          </div>
        </div>
        <div style={{ padding: 10, background: "#F8FAFC", borderRadius: 6 }}>
          <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Kërkuar nga</div>
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{order.requestedBy.firstName} {order.requestedBy.lastName}</div>
          {order.priority !== "normal" && (
            <div style={{ color: "#DC2626", fontWeight: 600, textTransform: "uppercase" }}>⚠ {order.priority}</div>
          )}
        </div>
      </div>

      {order.clinicalInfo && (
        <div style={{ padding: 10, background: "#FEF3C7", borderLeft: "3px solid #F59E0B", marginBottom: 16, fontSize: 11, whiteSpace: "pre-wrap" }}>
          <div style={{ fontWeight: 600 }}>Info klinike:</div>
          {order.clinicalInfo}
        </div>
      )}

      {Array.from(grouped.entries()).map(([name, results]) => (
        <div key={name} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid #CBD5E1" }}>{name}</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "#F1F5F9" }}>
                <th style={{ textAlign: "left", padding: 6, fontWeight: 600 }}>Parametri</th>
                <th style={{ textAlign: "right", padding: 6, fontWeight: 600 }}>Vlera</th>
                <th style={{ textAlign: "left", padding: 6, fontWeight: 600 }}>Njësia</th>
                <th style={{ textAlign: "left", padding: 6, fontWeight: 600 }}>Diapazoni</th>
                <th style={{ textAlign: "center", padding: 6, fontWeight: 600 }}>Flag</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const flagColor = r.flag === "CRITICAL" ? "#DC2626" : r.flag === "ABNORMAL" ? "#F59E0B" : r.flag === "NORMAL" ? "#10B981" : "#64748B";
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <td style={{ padding: 6 }}>{r.parameter.name}</td>
                    <td style={{ padding: 6, textAlign: "right", fontWeight: 600, fontFamily: "monospace" }}>{r.value || "—"}</td>
                    <td style={{ padding: 6, color: "#64748B" }}>{r.unit ?? r.parameter.unit ?? ""}</td>
                    <td style={{ padding: 6, color: "#64748B" }}>
                      {r.parameter.refRangeMin !== null && r.parameter.refRangeMax !== null
                        ? `${r.parameter.refRangeMin} – ${r.parameter.refRangeMax}`
                        : r.parameter.refRangeText ?? "—"}
                    </td>
                    <td style={{ padding: 6, textAlign: "center" }}>
                      <span style={{ background: flagColor, color: "white", padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 600 }}>
                        {r.flag}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      <div style={{ borderTop: "1px solid #CBD5E1", paddingTop: 16, marginTop: 24, fontSize: 10, color: "#64748B" }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Vërejtje:</strong> Rezultatet duhet të interpretohen nga mjeku klinik në kontekstin e gjendjes së pacientit dhe të dhënave të tjera klinike. Vlerat referente mund të ndryshojnë sipas moshës, gjinisë dhe metodës së përdorur.
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <div>
            <div style={{ borderTop: "1px solid #475569", paddingTop: 4, width: 200 }}>Laboranti përgjegjës</div>
          </div>
          <div>
            <div style={{ borderTop: "1px solid #475569", paddingTop: 4, width: 200 }}>Vula & nënshkrimi</div>
          </div>
        </div>
      </div>
    </div>
  );
}
