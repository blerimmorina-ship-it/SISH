-- ═══════════════════════════════════════════════════════════════════════════════
--  SISH — Row Level Security policies për Postgres/Supabase
--  Defense-in-depth: edhe nëse aplikacioni harron filtrin tenantId, DB e bllokon.
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Funksioni që lexon tenantId nga session_var-i (vendoset nga aplikacioni)
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS text AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')::text
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS text AS $$
  SELECT NULLIF(current_setting('app.user_role', true), '')::text
$$ LANGUAGE sql STABLE;

-- Helper: bypass për SUPER_ADMIN
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS boolean AS $$
  SELECT current_user_role() = 'SUPER_ADMIN'
$$ LANGUAGE sql STABLE;

-- ═══════════════════════════════════════════════════════════════════════════════
--  Aktivizo RLS + politika për të 22 tabelat tenant-scoped
-- ═══════════════════════════════════════════════════════════════════════════════

-- Macro pattern: çdo tabelë merr 1 policy që lejon vetëm rreshta nga tenanti aktiv.
-- SUPER_ADMIN bypasses gjithçka.

DO $$
DECLARE
  tbl text;
  scoped_tables text[] := ARRAY[
    'User', 'Department', 'Patient', 'Service', 'Visit', 'LabOrder',
    'Appointment', 'Invoice', 'Prescription', 'Document', 'AuditLog',
    'Setting', 'Quote', 'OperatingRoom', 'Surgery', 'Supplier', 'Warehouse',
    'ProductCategory', 'Product', 'Purchase', 'CashboxSession',
    'DischargeSheet', 'ClinicalTemplate', 'Workflow'
  ];
BEGIN
  FOREACH tbl IN ARRAY scoped_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);

    EXECUTE format('
      DROP POLICY IF EXISTS tenant_isolation ON %I;
      CREATE POLICY tenant_isolation ON %I
        FOR ALL
        USING (is_super_admin() OR "tenantId" = current_tenant_id())
        WITH CHECK (is_super_admin() OR "tenantId" = current_tenant_id());
    ', tbl, tbl);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
--  Tabelat cascade (nuk kanë tenantId direkt, por trashëgojnë nga prindi)
-- ═══════════════════════════════════════════════════════════════════════════════

-- VisitService — cascade nga Visit
ALTER TABLE "VisitService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VisitService" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "VisitService"
  FOR ALL
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Visit" WHERE "Visit".id = "VisitService"."visitId"
      AND "Visit"."tenantId" = current_tenant_id()
  ))
  WITH CHECK (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Visit" WHERE "Visit".id = "VisitService"."visitId"
      AND "Visit"."tenantId" = current_tenant_id()
  ));

-- LabTestTemplate — cascade nga Service
ALTER TABLE "LabTestTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LabTestTemplate" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "LabTestTemplate"
  FOR ALL
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Service" WHERE "Service".id = "LabTestTemplate"."serviceId"
      AND "Service"."tenantId" = current_tenant_id()
  ));

-- LabTestParameter — cascade nga LabTestTemplate
ALTER TABLE "LabTestParameter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LabTestParameter" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "LabTestParameter"
  FOR ALL
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "LabTestTemplate" t
    JOIN "Service" s ON s.id = t."serviceId"
    WHERE t.id = "LabTestParameter"."templateId"
      AND s."tenantId" = current_tenant_id()
  ));

-- LabResult — cascade nga LabOrder
ALTER TABLE "LabResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LabResult" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "LabResult"
  FOR ALL
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "LabOrder" WHERE "LabOrder".id = "LabResult"."orderId"
      AND "LabOrder"."tenantId" = current_tenant_id()
  ));

-- InvoiceItem — cascade nga Invoice
ALTER TABLE "InvoiceItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceItem" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "InvoiceItem"
  FOR ALL
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Invoice" WHERE "Invoice".id = "InvoiceItem"."invoiceId"
      AND "Invoice"."tenantId" = current_tenant_id()
  ));

-- Payment — cascade nga Invoice
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Payment"
  FOR ALL
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Invoice" WHERE "Invoice".id = "Payment"."invoiceId"
      AND "Invoice"."tenantId" = current_tenant_id()
  ));

-- PrescriptionItem — cascade nga Prescription
ALTER TABLE "PrescriptionItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PrescriptionItem" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "PrescriptionItem"
  FOR ALL
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Prescription" WHERE "Prescription".id = "PrescriptionItem"."prescriptionId"
      AND "Prescription"."tenantId" = current_tenant_id()
  ));

-- QuoteItem — cascade nga Quote
ALTER TABLE "QuoteItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteItem" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "QuoteItem"
  FOR ALL
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Quote" WHERE "Quote".id = "QuoteItem"."quoteId"
      AND "Quote"."tenantId" = current_tenant_id()
  ));

-- StockLevel — cascade nga Product
ALTER TABLE "StockLevel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockLevel" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "StockLevel"
  FOR ALL
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Product" WHERE "Product".id = "StockLevel"."productId"
      AND "Product"."tenantId" = current_tenant_id()
  ));

-- PurchaseItem — cascade nga Purchase
ALTER TABLE "PurchaseItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PurchaseItem" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "PurchaseItem"
  FOR ALL
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Purchase" WHERE "Purchase".id = "PurchaseItem"."purchaseId"
      AND "Purchase"."tenantId" = current_tenant_id()
  ));

-- Session — cascade nga User (që ka tenantId)
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Session"
  FOR ALL
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "User" WHERE "User".id = "Session"."userId"
      AND "User"."tenantId" = current_tenant_id()
  ));

-- ═══════════════════════════════════════════════════════════════════════════════
--  Tenant: vetëm SUPER_ADMIN mund t'i shohë të gjitha; user të tjerë vetëm tenantin e tyre
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_self_view ON "Tenant"
  FOR SELECT
  USING (is_super_admin() OR id = current_tenant_id());

-- Vetëm SUPER_ADMIN mund të krijojë/fshijë tenants
CREATE POLICY tenant_admin_only ON "Tenant"
  FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY tenant_update_self ON "Tenant"
  FOR UPDATE USING (is_super_admin() OR id = current_tenant_id())
  WITH CHECK (is_super_admin() OR id = current_tenant_id());
CREATE POLICY tenant_delete_admin ON "Tenant"
  FOR DELETE USING (is_super_admin());

-- ═══════════════════════════════════════════════════════════════════════════════
--  AuditLog: INSERT-only për të gjithë (immutability)
-- ═══════════════════════════════════════════════════════════════════════════════

REVOKE UPDATE, DELETE ON "AuditLog" FROM authenticated, anon, service_role;
-- Vetëm DBA mund të bëjë cleanup pas 7 vjet (kërkesë ligjore)

-- ═══════════════════════════════════════════════════════════════════════════════
--  Verifikim: lista e të gjitha policies
-- ═══════════════════════════════════════════════════════════════════════════════

-- SELECT schemaname, tablename, policyname, cmd
--   FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename;

COMMENT ON FUNCTION current_tenant_id() IS 'Returns the active tenantId set by the application via SET LOCAL app.tenant_id';
COMMENT ON FUNCTION is_super_admin() IS 'Returns true if the current user role is SUPER_ADMIN (cross-tenant access)';
