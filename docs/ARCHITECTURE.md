# SISH — Arkitektura

Ky dokument përshkruan zgjedhjet arkitekturore dhe vendimet kyçe.

## Përmbledhje e nivelit të lartë

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
│   React 19 · Next.js App Router · TanStack Query · Sonner   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS + JWT cookie
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Edge Middleware                           │
│   • Auth verification (jose)                                 │
│   • Public route allowlist                                   │
│   • Redirect to /login if unauthorized                       │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Server (Node)                       │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│   │ React Server │  │ API Routes   │  │ Server       │    │
│   │ Components   │  │ (route.ts)   │  │ Actions      │    │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│          │                 │                 │              │
│          ▼                 ▼                 ▼              │
│   ┌─────────────────────────────────────────────────┐      │
│   │  Application Layer                              │      │
│   │  • lib/auth.ts        (JWT + RBAC)              │      │
│   │  • lib/audit.ts       (audit logger)            │      │
│   │  • lib/password.ts    (Argon2)                  │      │
│   │  • lib/rate-limit.ts  (token bucket)            │      │
│   │  • Zod schemas        (validation)              │      │
│   └────────────────────┬────────────────────────────┘      │
│                        ▼                                    │
│   ┌─────────────────────────────────────────────────┐      │
│   │  Data Layer (Prisma)                            │      │
│   │  • 18 models                                    │      │
│   │  • Type-safe queries                            │      │
│   │  • Connection pooling (singleton)               │      │
│   └────────────────────┬────────────────────────────┘      │
└────────────────────────┼────────────────────────────────────┘
                         ▼
                ┌────────────────────┐
                │  PostgreSQL / SQLite│
                └────────────────────┘
```

## Vendimet kyçe

### 1. Next.js App Router
RSC (React Server Components) si default → më pak JavaScript në klient, më shpejt, më SEO-friendly.

### 2. Prisma + SQLite për dev / PostgreSQL për prod
- **Dev**: SQLite — file-based, pa setup
- **Prod**: PostgreSQL — full-text search, JSON ops, scaling

### 3. JWT (jose) në vend të DB-stored sessions
- Stateless → më e shpejtë, më e shkallueshme
- Edge middleware mund t'i verifikojë (Edge runtime mbështet `jose`)
- Sesionet ende ekzistojnë në DB për revoke të menjëhershëm nëse nevojitet

### 4. Argon2id për fjalëkalimet
- Fitues i Password Hashing Competition 2015
- I rekomanduar nga OWASP
- Konfigurim me 19 MiB memory cost — rezistent ndaj GPU/ASIC

### 5. RBAC (Role-Based Access Control)
- 8 role të paracaktuar
- Lejet janë listë e statike (compile-time)
- Çdo route serveri verifikon `hasPermission()` para se të procesojë

### 6. Audit log si side-effect
- Çdo veprim kritik thirr `audit()`
- Failure në audit nuk break-on requestin (try/catch)
- Indekse mbi (entityType, entityId), (userId), (action), (createdAt)

### 7. Rate limiting in-memory
- Token bucket
- Pjekur për single-instance
- **Prod**: zëvendëso me Redis/Upstash për multi-instance

## Skema e bazës

### Entitet kryesor

```
User ──┬── Session (1:N)
       ├── AuditLog (1:N)
       └── Department (N:1, optional)

Patient ──┬── Visit (1:N)
          ├── LabOrder (1:N)
          ├── Appointment (1:N)
          ├── Invoice (1:N)
          ├── Document (1:N)
          └── Prescription (1:N)

Visit ──┬── VisitService (1:N) ──── Service
        ├── LabOrder (1:N)
        ├── Prescription (1:N)
        └── Invoice (1:1, optional)

LabOrder ──┬── LabResult (1:N) ──── LabTestParameter
           └── Department

Service ──── LabTestTemplate (1:1, optional)
              └── LabTestParameter (1:N)

Invoice ──┬── InvoiceItem (1:N)
          └── Payment (1:N)
```

### Strategji indeksimi
- Çdo `code`, `email`, `personalId` është `@unique` me indeks
- Foreign keys kanë indekse
- Filtrat e shpeshtë (status, scheduledAt) kanë indekse të dedikuara

## Modeli i sigurisë

### Linja e mbrojtjes 1: Edge middleware
- Verifikon JWT
- Refuzon kërkesat pa token për rrugë private

### Linja e mbrojtjes 2: Server-side route guard
- `getCurrentSession()` te çdo route handler
- `hasPermission()` për veprime sensitive

### Linja e mbrojtjes 3: Validimi i input-it
- Zod schemas për të gjitha API routes
- Type narrowing automatik

### Linja e mbrojtjes 4: Database
- Prisma parameterized queries → no SQL injection
- Foreign key constraints + `onDelete: Restrict` për të dhëna kritike

### Linja e mbrojtjes 5: Output sanitization
- React auto-escape për XSS
- CSP header bllokon inline scripts (përveç eval për dev)

## Vrojtimi (Observability)

### Çfarë regjistrohet
- Audit log: çdo veprim CRUD, login, eksport, print
- Console: errors, warns
- Network: ratet e response time (mund të shtohen middleware-s)

### Çfarë mungon (për produksion)
- Distributed tracing (OpenTelemetry)
- Metrics dashboard (Prometheus/Grafana)
- Error reporting (Sentry)
- Performance monitoring (Vercel Analytics, etj.)

## Performanca

### Strategji caching
- RSC default cache për queries të statike
- `dynamic = 'force-dynamic'` për dashboard / lista (data freshness)
- Future: ISR + on-demand revalidation për raporte të mëdha

### Bundle size
- Geist fonts: variable, vetëm ngarkohet që përdoret
- Tree-shaking i Lucide ikonave
- shadcn-style components: vetëm ato që importohen

## Ekstensibilitet

### Të shtosh një modul të ri
1. Shto modelet në `prisma/schema.prisma`
2. `npm run db:push` ose krijo migration
3. Shto rrugën te `src/config/nav.ts`
4. Krijo direktorinë `src/app/(app)/{module}/`
5. Krijo API routes te `src/app/api/{module}/`
6. (Opsionale) Shto leje te `lib/auth.ts` PERMISSIONS

### Të shtosh një rol të ri
1. Shto value-n te `Role` enum në Prisma
2. `db:push`
3. Shto label te `ROLE_LABELS` te `lib/auth.ts`
4. Përditëso `PERMISSIONS` matrix
5. Përditëso seed
