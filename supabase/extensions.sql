-- ═══════════════════════════════════════════════════════════════════════════════
--  SISH — Postgres extensions për Supabase
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Enkriptim shtesë për fusha sensitive (PHI)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. UUID alternative (në krijim të personalizuar)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Cron jobs për Workflows (kujtues termini, alarme stoku, etj.)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 4. Full-text search trigram (kërkim "fuzzy" pacientësh)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 5. Query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 6. JSONB operators të avancuar
CREATE EXTENSION IF NOT EXISTS hstore;

-- ═══════════════════════════════════════════════════════════════════════════════
--  Indekse të avancuar (përtej Prisma defaults)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Full-text search për pacientë (emër + mbiemër + tel + ID personale)
CREATE INDEX IF NOT EXISTS idx_patient_fts ON "Patient" USING gin(
  to_tsvector('simple',
    "firstName" || ' ' ||
    "lastName" || ' ' ||
    COALESCE("phone", '') || ' ' ||
    COALESCE("personalId", '') || ' ' ||
    COALESCE("code", '')
  )
);

-- Trigram për kërkim "fuzzy" emrash (Albanian-specific)
CREATE INDEX IF NOT EXISTS idx_patient_name_trgm ON "Patient"
  USING gin (("firstName" || ' ' || "lastName") gin_trgm_ops);

-- Composite për dashboard time-range queries
CREATE INDEX IF NOT EXISTS idx_visit_tenant_date ON "Visit"("tenantId", "scheduledAt" DESC);
CREATE INDEX IF NOT EXISTS idx_appointment_tenant_date ON "Appointment"("tenantId", "scheduledAt" ASC);
CREATE INDEX IF NOT EXISTS idx_lab_order_tenant_status ON "LabOrder"("tenantId", "status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_tenant_status ON "Invoice"("tenantId", "status", "issuedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_payment_invoice_date ON "Payment"("invoiceId", "paidAt" DESC);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_date ON "AuditLog"("tenantId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON "AuditLog"("entityType", "entityId");

-- Lab results historik (trend graphs për pacientë)
CREATE INDEX IF NOT EXISTS idx_lab_result_param_date ON "LabResult"("parameterId", "enteredAt" DESC);

-- Stock alerts (find products under min)
CREATE INDEX IF NOT EXISTS idx_product_low_stock ON "Product"("tenantId", "minStock")
  WHERE "minStock" > 0 AND "isActive" = true;

-- ═══════════════════════════════════════════════════════════════════════════════
--  Cron jobs (pg_cron)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Pastro sesione të skaduara çdo orë
SELECT cron.schedule(
  'cleanup-expired-sessions',
  '0 * * * *',
  $$DELETE FROM "Session" WHERE "expiresAt" < NOW()$$
);

-- Skadimi automatik i ofertave të pakaluara
SELECT cron.schedule(
  'expire-old-quotes',
  '0 2 * * *',  -- çdo natë në 02:00
  $$UPDATE "Quote" SET status = 'EXPIRED'
    WHERE "validUntil" < NOW() AND status IN ('DRAFT', 'SENT')$$
);

-- Pastro audit logs më të vjetër se 7 vjet (kërkesë ligjore mjekësore)
SELECT cron.schedule(
  'archive-old-audit-logs',
  '0 3 1 * *',  -- ditën e parë të çdo muaji në 03:00
  $$DELETE FROM "AuditLog" WHERE "createdAt" < NOW() - INTERVAL '7 years'$$
);

-- Lloj njoftimesh: kujtues 24h para terminit (nëse Workflow është aktiv)
-- (Kjo do të triggeroje API endpoint nëpërmjet pg_net ose me Supabase Edge Function)
SELECT cron.schedule(
  'appointment-reminder-24h',
  '0 9 * * *',  -- çdo ditë në 09:00
  $$
    INSERT INTO "AuditLog" ("id", "tenantId", "action", "entityType", "metadata", "createdAt")
    SELECT
      gen_random_uuid()::text,
      a."tenantId",
      'EXPORT',
      'AppointmentReminder',
      jsonb_build_object('appointmentId', a.id, 'patientId', a."patientId")::text,
      NOW()
    FROM "Appointment" a
    WHERE a."scheduledAt"::date = (CURRENT_DATE + INTERVAL '1 day')::date
      AND a.status IN ('SCHEDULED', 'CONFIRMED');
  $$
);

-- ═══════════════════════════════════════════════════════════════════════════════
--  Partitioning për AuditLog (vetëm nëse pritet > 10M rreshta)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Komentuar — aktivizo në prodhim kur AuditLog kalon 5M rreshta
-- ALTER TABLE "AuditLog" ... PARTITION BY RANGE ("createdAt");
-- CREATE TABLE audit_2026 PARTITION OF "AuditLog" FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- ═══════════════════════════════════════════════════════════════════════════════
--  Realtime publication (Supabase Realtime)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Aktivizo realtime për tabelat ku duam push notifications në klient
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE
  "LabResult",        -- mjeku sheh rezultatet sapo dalin
  "AuditLog",         -- live activity feed
  "Appointment",      -- kalendar i sinkronizuar midis stafit
  "Visit",            -- queue i pacientëve në triazh
  "Payment";          -- arka në kohë reale
