// Supabase Edge Function — dërgim SMS kujtues 24h para terminit
// Deploy: supabase functions deploy send-appointment-reminder

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AppointmentRow {
  id: string;
  tenantId: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  reason: string | null;
}

interface PatientRow {
  firstName: string;
  lastName: string;
  phone: string | null;
}

interface DoctorRow {
  firstName: string;
  lastName: string;
}

interface TenantRow {
  name: string;
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Gjej terminet që janë nesër (mes 09:00 dhe 09:00+24h)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayStart = new Date(tomorrow.setHours(0, 0, 0, 0));
  const dayEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

  const { data: appointments, error } = await supabase
    .from("Appointment")
    .select(`
      id, tenantId, patientId, doctorId, scheduledAt, reason,
      patient:Patient!inner ( firstName, lastName, phone ),
      doctor:User!inner ( firstName, lastName ),
      tenant:Tenant!inner ( name )
    `)
    .gte("scheduledAt", dayStart.toISOString())
    .lte("scheduledAt", dayEnd.toISOString())
    .in("status", ["SCHEDULED", "CONFIRMED"]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  for (const a of appointments ?? []) {
    const patient = (a as never as { patient: PatientRow }).patient;
    const doctor = (a as never as { doctor: DoctorRow }).doctor;
    const tenant = (a as never as { tenant: TenantRow }).tenant;
    if (!patient.phone) {
      skipped++;
      continue;
    }

    const time = new Date(a.scheduledAt).toLocaleTimeString("sq-AL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const message = `Përshëndetje ${patient.firstName}! Kujtues: ke termin nesër në ${time} me Dr. ${doctor.firstName} ${doctor.lastName} (${tenant.name}). Anuloje me kohë nëse s'mund të vish.`;

    // Dërgo via Twilio (ose provider tjetër)
    // await sendSms(patient.phone, message);

    // Regjistro në AuditLog
    await supabase.from("AuditLog").insert({
      tenantId: a.tenantId,
      action: "EXPORT",
      entityType: "AppointmentReminder",
      entityId: a.id,
      metadata: JSON.stringify({ phone: patient.phone, message }),
    });

    sent++;
  }

  return new Response(
    JSON.stringify({ ok: true, sent, skipped, total: appointments?.length ?? 0 }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
});
