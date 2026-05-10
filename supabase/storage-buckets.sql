-- ═══════════════════════════════════════════════════════════════════════════════
--  SISH — Supabase Storage buckets configuration
-- ═══════════════════════════════════════════════════════════════════════════════

-- Bucket 1: Logot e klinikave (publike, optimizim përmes Supabase CDN)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sish-logos',
  'sish-logos',
  true,
  2097152,  -- 2 MB
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 2: Dokumente pacientësh (PRIVAT — RLS i detyrueshëm)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sish-patient-docs',
  'sish-patient-docs',
  false,
  20971520,  -- 20 MB
  ARRAY[
    'application/pdf',
    'image/png', 'image/jpeg', 'image/dicom',
    'application/dicom',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 3: Nënshkrime digjitale (privat, e zhdukur pas 7 vjet)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sish-signatures',
  'sish-signatures',
  false,
  524288,  -- 512 KB
  ARRAY['image/png', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 4: Backups automatikë (privat, vetëm SUPER_ADMIN)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'sish-backups',
  'sish-backups',
  false,
  5368709120  -- 5 GB për backup të madh
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 5: Foto pacientësh (privat)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sish-patient-photos',
  'sish-patient-photos',
  false,
  3145728,  -- 3 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
--  RLS policies për Storage (izolim sipas tenant)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Konventa e folderëve: <bucket>/<tenantId>/<filename>
-- Kjo lejon RLS të kontrollojë qasjen vetëm nga tenanti përkatës.

-- sish-patient-docs: vetëm tenanti i pacientit mund të lexojë
CREATE POLICY "tenant_read_patient_docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'sish-patient-docs'
    AND (storage.foldername(name))[1] = current_setting('app.tenant_id', true)
  );

CREATE POLICY "tenant_write_patient_docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'sish-patient-docs'
    AND (storage.foldername(name))[1] = current_setting('app.tenant_id', true)
  );

CREATE POLICY "tenant_delete_patient_docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'sish-patient-docs'
    AND (storage.foldername(name))[1] = current_setting('app.tenant_id', true)
  );

-- sish-signatures (njëjtë)
CREATE POLICY "tenant_signatures_all"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'sish-signatures'
    AND (storage.foldername(name))[1] = current_setting('app.tenant_id', true)
  );

-- sish-patient-photos (njëjtë)
CREATE POLICY "tenant_photos_all"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'sish-patient-photos'
    AND (storage.foldername(name))[1] = current_setting('app.tenant_id', true)
  );

-- sish-backups: vetëm SUPER_ADMIN
CREATE POLICY "super_admin_only_backups"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'sish-backups'
    AND current_setting('app.user_role', true) = 'SUPER_ADMIN'
  );

-- sish-logos: lexim publik (CDN), shkrim vetëm nga tenanti vetë
CREATE POLICY "logos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sish-logos');

CREATE POLICY "tenant_write_own_logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'sish-logos'
    AND (storage.foldername(name))[1] = current_setting('app.tenant_id', true)
  );
