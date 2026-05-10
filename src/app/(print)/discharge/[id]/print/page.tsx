import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PrintToolbar } from "../../../print-toolbar";

export const dynamic = "force-dynamic";

export default async function DischargePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sheet = await prisma.dischargeSheet.findUnique({ where: { id } });
  if (!sheet) notFound();
  const patient = await prisma.patient.findUnique({ where: { id: sheet.patientId } });

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 32, color: "#0F172A" }}>
      <PrintToolbar backHref={`/discharge/${id}`} />

      <div style={{ borderBottom: "2px solid #6366F1", paddingBottom: 16, marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>FLETËLËSHIM</div>
          <div style={{ fontSize: 11, color: "#64748B" }}>Klinika Demo SISH</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>{sheet.number}</div>
        </div>
      </div>

      {patient && (
        <div style={{ padding: 12, background: "#F8FAFC", borderRadius: 6, marginBottom: 24, fontSize: 12 }}>
          <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Pacienti</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{patient.firstName} {patient.lastName}</div>
          <div style={{ color: "#475569" }}>
            {patient.code}
            {patient.dateOfBirth && ` · Lindur: ${formatDate(patient.dateOfBirth)}`}
            {patient.phone && ` · ${patient.phone}`}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24, fontSize: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Pranuar</div>
          <div style={{ fontWeight: 600, marginTop: 2 }}>{formatDateTime(sheet.admittedAt)}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Lëshuar</div>
          <div style={{ fontWeight: 600, marginTop: 2 }}>{sheet.dischargedAt ? formatDateTime(sheet.dischargedAt) : "—"}</div>
        </div>
      </div>

      <Section title="Diagnoza primare">
        <div style={{ padding: 10, background: "#EEF2FF", borderLeft: "3px solid #6366F1", fontWeight: 600 }}>
          {sheet.primaryDiagnosis}
        </div>
      </Section>

      {sheet.secondaryDiagnoses && (
        <Section title="Diagnoza sekondare">
          <div style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{sheet.secondaryDiagnoses}</div>
        </Section>
      )}

      {sheet.treatmentSummary && (
        <Section title="Përmbledhja e trajtimit">
          <div style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{sheet.treatmentSummary}</div>
        </Section>
      )}

      {sheet.recommendations && (
        <Section title="Rekomandime">
          <div style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{sheet.recommendations}</div>
        </Section>
      )}

      {sheet.followUpDate && (
        <div style={{ marginTop: 16, padding: 10, background: "#FEF3C7", borderRadius: 6, fontSize: 12 }}>
          <strong>📅 Vizita kontrolluese:</strong> {formatDate(sheet.followUpDate)}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 64, fontSize: 11 }}>
        <div>
          <div style={{ borderTop: "1px solid #475569", paddingTop: 4, width: 200 }}>Mjeku përgjegjës</div>
        </div>
        <div>
          <div style={{ borderTop: "1px solid #475569", paddingTop: 4, width: 200 }}>Vula & nënshkrimi</div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{title}</h3>
      {children}
    </div>
  );
}
