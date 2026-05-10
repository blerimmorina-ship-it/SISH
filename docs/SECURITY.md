# SISH — Politika e Sigurisë

## Lloji i të dhënave

SISH përpunon **Personal Health Information (PHI)** dhe është subjekt i:
- GDPR (Bashkimi Europian)
- Ligji Nr. 06/L-082 për Mbrojtjen e të Dhënave Personale (Kosovë)
- HIPAA (nëse përdoret në SHBA)

## Modeli i kërcënimit

### Kërcënimet që mbrohen
| Kërcënimi              | Mbrojtja                                              |
| ---------------------- | ----------------------------------------------------- |
| SQL Injection          | Prisma parameterized queries                          |
| XSS                    | React auto-escape + CSP header                        |
| CSRF                   | SameSite=Lax cookies + origin checks                  |
| Brute force login      | Account lockout (5 attempts/15 min) + rate limit      |
| Session hijack         | httpOnly + secure + SameSite cookies                  |
| Password leak          | Argon2id (19 MiB, 2 iterations)                       |
| Privilege escalation   | RBAC në çdo route + audit log                         |
| Clickjacking           | X-Frame-Options: DENY                                 |
| MIME sniffing          | X-Content-Type-Options: nosniff                       |
| TLS downgrade          | HSTS me preload                                       |
| Supply chain           | npm audit; lock dependencies                          |

### Kërcënimet që NUK mbulohen (ende)
- DDoS në nivel rrjeti (kërkohet CDN/WAF)
- Insider threats fizike (kërkohet kontroll i hyrjes në server)
- Ransomware (kërkohet backup-i jashtë vend)

## Praktikat e zhvillimit të sigurt

1. **Asnjëherë mos commit secrets** — `.env` është në `.gitignore`
2. **Krahasime konstante kohore** për shenja (Argon2 e bën automatik)
3. **Validimi i tipeve** me Zod për çdo input
4. **Output encoding** auto nga React
5. **Përditësime të rregullta** — `npm audit` çdo javë
6. **Code review** — minimum 1 reviewer për PR

## Konfigurimi i prodhimit

### Variablat e ambientit
```
AUTH_SECRET           — 32+ random bytes (rotate çdo 6 muaj)
DATABASE_URL          — postgres:// me SSL
NODE_ENV=production
```

### Headers (të aplikuara nga `next.config.ts`)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), ...`
- `Content-Security-Policy: ...`

### Konfigurimi i serverit
- TLS 1.3 only
- Forward only TLS portet (80 → 443)
- Database në VPC private (aksesi nga aplikacioni vetëm)
- Backup automatik çdo 6h, encrypted at rest

## Përgjigjja ndaj incidenteve

1. **Detektim**: monitoring + audit log
2. **Përmbajtja**: revoke sessions, lock accounts
3. **Eradicimi**: identifiko shkaktarin, patch
4. **Rikuperimi**: rivendosje nga backup nëse nevojitet
5. **Mësimet**: post-mortem dhe update i playbook-ut

## Raportimi i vulnerabiliteteve

Nëse zbuloni një vulnerabilitet, ju lutem dërgoni email te:
- security@sish.local (placeholder — replace me email-in real)

Ne premtojmë:
- Përgjigje brenda 48h
- Patch brenda 30 ditë për kritike
- Të mos ndjekim ligjërisht raportues etikë

## Pajtueshmëria

### GDPR / Ligji i Mbrojtjes së të Dhënave
- ✅ E drejta e qasjes (eksport pacient)
- ✅ E drejta për korrigjim (CRUD)
- ⚠️ E drejta për fshirje (kërkon procedurë — soft-delete me `isActive`)
- ✅ Pëlqim eksplicit për përpunim (në regjistrim)
- ✅ Audit log
- ⚠️ DPIA — duhet të kryhet para vendosjes

### Vlefshmëria e të dhënave
- Backup minimumi 7 vite për të dhënat mjekësore (kërkesë ligjore në shumë juridiksione)
- Encrypted at rest dhe in transit

## Lista e kontrollit para go-live

- [ ] AUTH_SECRET i ri prodhimi
- [ ] HTTPS me sertifikatë të vlefshme
- [ ] DATABASE_URL me SSL
- [ ] Rate limiter në Redis (jo in-memory)
- [ ] Backup i konfiguruar dhe i testuar
- [ ] Logu jashtë server-it (kuti e zezë)
- [ ] Sentry / error reporting
- [ ] DPIA e nënshkruar
- [ ] Politika e privatësisë e botuar
- [ ] Trajnim i stafit për sigurinë
