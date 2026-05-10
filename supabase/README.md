# SISH — Supabase Deployment Guide

Kjo dosje përmban gjithçka për të vendosur SISH në prodhim me Supabase.

## 📋 Inventari

| Skedari | Qëllimi |
|---|---|
| `rls-policies.sql` | Row Level Security për 35 tabela (defense-in-depth) |
| `extensions.sql` | Postgres extensions + indekse + cron jobs |
| `storage-buckets.sql` | 5 storage buckets me RLS |
| `migrate-from-sqlite.ts` | Script migrimi i të dhënave SQLite → Postgres |
| `.env.supabase.example` | Variablat e ambientit për prodhim |

## 🚀 Quickstart (8 hapa)

### 1. Krijo projekt Supabase
```
- Shko në https://supabase.com/dashboard
- Krijo projekt të ri në rajonin Frankfurt (eu-central-1) — për GDPR
- Zgjidh planin Pro (8 GB DB, $25/muaj) ose më të lartë
- Ruaj DATABASE_URL dhe DIRECT_URL nga Settings → Database
```

### 2. Konfiguro .env
```bash
cp supabase/.env.supabase.example .env.production
# Plotëso DATABASE_URL, DIRECT_URL, dhe API keys
```

### 3. Përditëso Prisma për Postgres
Te `prisma/schema.prisma` ndrysho:
```prisma
datasource db {
  provider  = "postgresql"  // ← nga "sqlite"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 4. Push schema te Postgres
```bash
npx prisma migrate deploy --schema prisma/schema.prisma
# Ose, për fillim:
npx prisma db push
```

### 5. Aplikim i RLS policies
```bash
psql "$DIRECT_URL" -f supabase/rls-policies.sql
```

### 6. Aplikim i extensions + indeksave
```bash
psql "$DIRECT_URL" -f supabase/extensions.sql
```

### 7. Krijim i storage buckets
```bash
psql "$DIRECT_URL" -f supabase/storage-buckets.sql
```

### 8. Migrim i të dhënave (vetëm nëse ke SQLite)
```bash
npx tsx supabase/migrate-from-sqlite.ts
```

## 🔧 Integrim aplikacioni me RLS

Për të vendosur tenantId në çdo request, përditëso `lib/db.ts`:

```typescript
// Kur përdor Postgres, vendos tenantId në session-var para çdo query
const tenantPrisma = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const tenantId = await getCurrentTenantId();
        const role = await getCurrentRole();
        if (tenantId) {
          await prisma.$executeRaw`SET LOCAL app.tenant_id = ${tenantId}`;
          await prisma.$executeRaw`SET LOCAL app.user_role = ${role ?? 'VIEWER'}`;
        }
        return query(args);
      },
    },
  },
});
```

Kjo siguron që edhe nëse aplikacioni e harron filtrin, **Postgres RLS e bllokon në nivelin e DB**.

## 🛡️ Siguria — defense in depth

```
┌──────────────────────────────────────────────────┐
│  Layer 1: Next.js middleware                     │
│  → Refuzon requests pa JWT të vlefshëm          │
├──────────────────────────────────────────────────┤
│  Layer 2: Prisma extension (forTenant)           │
│  → Auto-filter where: { tenantId } në app        │
├──────────────────────────────────────────────────┤
│  Layer 3: Postgres RLS (rls-policies.sql)       │
│  → DB refuzon edhe nëse query është "naked"     │
├──────────────────────────────────────────────────┤
│  Layer 4: AuditLog INSERT-only                   │
│  → S'mund të fshihet/manipulohet                 │
└──────────────────────────────────────────────────┘
```

## 📊 Monitorim në prodhim

### Query-të më të ngadalta
```sql
SELECT query, calls, mean_exec_time, total_exec_time
  FROM pg_stat_statements
  ORDER BY total_exec_time DESC
  LIMIT 20;
```

### Tabelat më të mëdha
```sql
SELECT schemaname, relname, n_live_tup, pg_size_pretty(pg_total_relation_size(relid)) AS size
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(relid) DESC
  LIMIT 20;
```

### Cron jobs aktivë
```sql
SELECT * FROM cron.job;
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
```

## 💾 Backups

| Plan | Backup retention | PITR |
|---|---|---|
| Free | 1 ditë | ❌ |
| Pro | 7 ditë | ✅ (deri 7 ditë mbrapa) |
| Team | 14 ditë | ✅ |
| Enterprise | 30 ditë | ✅ + replikë cross-region |

**Rekomandim**: shto backup ditor në `sish-backups` bucket (ose S3 jashtë Supabase) për disaster recovery.

```sql
-- Cron job për backup ditor në bucket
SELECT cron.schedule(
  'daily-backup',
  '0 4 * * *',
  $$
    -- Përdor pg_dump nga jashtë (Edge Function ose CI cronjob)
    SELECT 'see Edge Function: backup-database';
  $$
);
```

## 🌐 Realtime (push notifications)

Aktivizimi te `extensions.sql` — frontendi mund të dëgjojë:

```typescript
import { createClient } from '@supabase/supabase-js';

const supa = createClient(URL, ANON_KEY);

// Kur futet rezultat kritik, mjeku merr alarm menjëherë
supa.channel('lab-results')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'LabResult',
    filter: `flag=eq.CRITICAL`,
  }, (payload) => {
    showAlert('Rezultat kritik për pacientin');
  })
  .subscribe();
```

## ⚙️ Edge Functions (recommended)

Krijo 4 edge functions për Workflows që kanë side-effects (email/SMS):

| Funksioni | Trigger | Veprimi |
|---|---|---|
| `send-appointment-reminder` | pg_cron @ 09:00 | SMS pacientit 24h para terminit |
| `notify-critical-result` | DB trigger në LabResult | Push + SMS te mjeku |
| `daily-backup` | pg_cron @ 04:00 | pg_dump → Storage bucket |
| `expire-trials` | pg_cron @ 00:00 | Pezullo tenantet me trial të skaduar |

```bash
# Krijo edge function
supabase functions new send-appointment-reminder
# Deploy
supabase functions deploy send-appointment-reminder
```

## 🚦 Health check & monitoring

| Tool | Qëllimi |
|---|---|
| Supabase Studio | Query editor + DB inspector |
| pg_stat_statements | Query performance |
| Sentry / Logflare | Error tracking |
| Better Stack | Uptime monitoring |
| Grafana + Postgres exporter | Custom dashboards |

## ⚠️ Kujdes para go-live

- [ ] Ndrysho AUTH_SECRET (minimum 64 chars random)
- [ ] Aktivizo HTTPS i detyrueshëm
- [ ] Konfiguro SMTP për email (Resend/SendGrid)
- [ ] Test DR: simulo restore nga backup
- [ ] DPIA i nënshkruar (GDPR — Data Protection Impact Assessment)
- [ ] Politika e privatësisë botuar
- [ ] Trajnim staf për sigurinë
- [ ] Test load me Artillery/k6 (≥100 concurrent users)
- [ ] Konfiguro rate limiting në Cloudflare (përpara Supabase)
- [ ] Monitor disa ditë para se të shtosh klinika reale
