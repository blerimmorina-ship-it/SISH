# SISH — Sistemi Informatik Shëndetësor

Platformë premium për menaxhimin e praktikës mjekësore. Pacientë, vizita, laborator, faturim dhe raporte — të integruara në një sistem të vetëm me dizajn modern dhe siguri të nivelit ndërkombëtar.

![SISH](./src/app/icon.svg)

---

## Karakteristikat kryesore

### Module
- **Paneli kryesor** — KPI, grafikët e të ardhurave, vizitat e fundit, terminet
- **Pacientët** — regjistrim i plotë me alergji, sigurim, kontakt urgjence
- **Vizitat** — konsultat me diagnoza, ekzaminime, shërbime
- **Laboratori** — urdhrat, rezultatet, shabllonet me parametra dhe diapazone
- **Terminet** — kalendar i takimeve me statuse
- **Recetat** — recetat mjekësore me barna
- **Faturimi** — fatura, pagesa, borxhet
- **Arka** — hyrjet ditore, raporti X / Z
- **Stoku** — inventari i materialeve
- **Ofertat** — shërbimet me çmime
- **Raportet** — financiare, klinike, demografike
- **Përdoruesit** — staf, role, leje
- **Aktiviteti** — audit log i plotë
- **Cilësimet** — klinika, siguria, brand, integrime

### Specialitete
23 departamente: Mjeku i Përgjithshëm, Pediatri, Gjinekologji, Kardiologji, Dermatologji, Neurologji, Ortopedi, Oftamologji, ORL, Urologji, Endokrinologji, Gastroenterologji, Onkologji, Psikologji & Psikiatri, Fizioterapi, Stomatologji, Biokimi, Mikrobiologji, Radiologji, Kirurgji, Ambulanta, Estetikë, Logopedi.

---

## Stack teknologjik

| Komponenti        | Teknologjia                                      |
| ----------------- | ------------------------------------------------ |
| Framework         | Next.js 15 (App Router, RSC)                     |
| Language          | TypeScript me `strict` + `noUncheckedIndexedAccess` |
| UI                | Tailwind CSS v3 + Radix Primitives + Lucide      |
| Theme             | `next-themes` me dark/light/system               |
| Charts            | Recharts                                         |
| Forms             | React Hook Form + Zod                            |
| ORM               | Prisma 5                                         |
| Database          | SQLite (dev) / PostgreSQL (prod)                 |
| Auth              | JWT (`jose`) + Argon2id                          |
| Notifications     | Sonner toasts                                    |
| Animations        | Framer Motion + Tailwind animate                 |

---

## Siguria

SISH është ndërtuar me siguri si gjë e parë:

- **Autentifikim** — JWT me HMAC-SHA256, sesion 8h (i konfigurueshëm), `httpOnly` cookies
- **Hashing** — Argon2id (19 MiB, 2 iterations) — i rekomanduar nga OWASP
- **RBAC** — 8 role me leje granulare (Super Admin, Admin, Doctor, Lab Tech, Nurse, Receptionist, Accountant, Viewer)
- **Account lockout** — 5 përpjekje të dështuara → bllokim 15 min
- **Audit log** — të gjitha veprimet kritike regjistrohen (CREATE/UPDATE/DELETE/LOGIN/EXPORT)
- **Rate limiting** — token bucket për endpoint-e të ndjeshme (login: 10/min/IP)
- **Security headers** — CSP, HSTS, X-Frame-Options, Permissions-Policy
- **CSRF** — same-site cookies + origin checks
- **Input validation** — Zod në çdo route
- **No secrets in URL** — të gjithë parametrat e ndjeshëm në body
- **Password strength** — vlerësim në klient + minimum 8 char

---

## Dizajni

### Paleta
- **Primary**: Indigo `#6366F1` → degradim me Aurora
- **Accent**: Emerald `#10B981`
- **Status**: Success / Warning / Info / Destructive me variantet HSL
- **Themes**: Light premium + Dark me kontrast të lartë (WCAG AA+)

### Tipografi
- Font: **Geist Sans** + **Geist Mono** (variable)
- Font features: `rlig`, `calt`, `ss01`

### Komponentët
- Glassmorphism cards (`backdrop-blur-xl`)
- Aurora background për faqet kryesore
- Premium shadows (`shadow-glow`, `shadow-premium`)
- Shimmer skeleton loaders
- Smooth fade-up animations

### 4K-ready
- Container deri 2560px
- Font-size auto-rritet në ekrane >2560px
- Layout responsive nga mobile (320px) deri 4K

---

## Struktura

```
SISH/
├─ prisma/
│  ├─ schema.prisma         # Skema e bazës — 18 modele
│  └─ seed.ts               # Demo data (departamente, përdorues, shërbime)
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/      # Faqja e kyçjes
│  │  ├─ (app)/             # Aplikacioni i mbrojtur
│  │  │  ├─ dashboard/      # Paneli kryesor
│  │  │  ├─ patients/       # CRUD pacientësh
│  │  │  ├─ visits/         # Vizitat
│  │  │  ├─ lab/            # Laboratori (orders, results, templates)
│  │  │  ├─ appointments/   # Kalendari
│  │  │  ├─ billing/        # Faturat
│  │  │  ├─ cashbox/        # Arka
│  │  │  ├─ reports/        # Raportet
│  │  │  ├─ users/          # Stafi (admin)
│  │  │  ├─ settings/       # Cilësimet
│  │  │  ├─ activity/       # Audit log
│  │  │  └─ profile/        # Profili
│  │  ├─ api/
│  │  │  ├─ auth/           # /login /logout
│  │  │  ├─ patients/       # CRUD pacientësh
│  │  │  └─ health/         # health check
│  │  ├─ globals.css        # Tema + design system
│  │  └─ layout.tsx
│  ├─ components/
│  │  ├─ brand/             # Logo + identitet
│  │  ├─ layout/            # Sidebar, Topbar
│  │  ├─ theme-provider.tsx
│  │  ├─ theme-toggle.tsx
│  │  └─ ui/                # Button, Input, Card, etj.
│  ├─ config/
│  │  └─ nav.ts             # Konfigurimi i navigjimit
│  ├─ lib/
│  │  ├─ auth.ts            # JWT + RBAC
│  │  ├─ password.ts        # Argon2 + strength check
│  │  ├─ db.ts              # Prisma singleton
│  │  ├─ rate-limit.ts      # Token bucket
│  │  ├─ audit.ts           # Audit logger
│  │  └─ utils.ts           # Helpers (formatim, etj.)
│  └─ middleware.ts         # Edge auth middleware
├─ next.config.ts
├─ tailwind.config.ts
└─ tsconfig.json
```

---

## Fillimi i shpejtë

### Parakushtet
- Node.js 20+ (testuar me 24)
- npm 10+

### Instalimi

```bash
# 1. Instalo varësitë
npm install

# 2. Konfiguro .env
cp .env.example .env
# Gjenero AUTH_SECRET (32+ char):
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
# Vendose në .env si AUTH_SECRET

# 3. Inicializo bazën
npm run db:push
npm run db:seed

# 4. Nise serverin
npm run dev
```

Hap http://localhost:3000

### Llogaritë demo

| Roli           | Email                  | Fjalëkalimi |
| -------------- | ---------------------- | ----------- |
| Super Admin    | admin@sish.local       | Admin123!   |
| Mjek           | doctor@sish.local      | Admin123!   |
| Laborant       | labtech@sish.local     | Admin123!   |

> ⚠️ **Ndrysho fjalëkalimet** përpara se të vendosësh në prodhim.

---

## Komandat

| Komanda             | Funksioni                            |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Server zhvillimi me Turbopack        |
| `npm run build`     | Build prodhimi                       |
| `npm run start`     | Start server prodhimi                |
| `npm run lint`      | ESLint                               |
| `npm run typecheck` | Verifiko TypeScript                  |
| `npm run db:push`   | Sinkronizo skemën me DB              |
| `npm run db:seed`   | Mbush DB me të dhëna demo            |
| `npm run db:studio` | Hap Prisma Studio                    |
| `npm run db:migrate`| Krijo migration të ri                |

---

## Vendosje në prodhim

1. **Database**: kalo nga SQLite në PostgreSQL — ndrysho `provider` te `prisma/schema.prisma` dhe `DATABASE_URL` në `.env`.
2. **AUTH_SECRET**: gjenero një vlerë të re prodhimi (kurrë mos përdor demo).
3. **HTTPS**: aktivizo TLS — cookies janë `secure` automatikisht në produksion.
4. **Rate limiting**: zëvendëso `lib/rate-limit.ts` me Redis/Upstash për multi-instance.
5. **Audit log**: planifiko backup periodik dhe rotation.
6. **Email/SMS**: konfiguro provider (Resend, Twilio) për njoftime.

---

## Roadmap

- [ ] 2FA me TOTP (skema gati)
- [ ] Eksport PDF i faturave dhe rezultateve
- [ ] HL7/FHIR integration
- [ ] Push notifications për mjekët
- [ ] Mobile app (React Native)
- [ ] AI assistant për kodim diagnostik (ICD-10)
- [ ] Telemedicine (video calls)
- [ ] Patient portal për self-service

---

## Licenca

Pronësia intelektuale e këtij sistemi i takon zhvilluesve të SISH. Përdorimi është i kufizuar sipas marrëveshjes.

---

**SISH** — Ndërtuar me ❤️ në Kosovë.
