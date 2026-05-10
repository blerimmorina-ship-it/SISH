/**
 * SISH multi-tenant seed — creates 3 demo clinics with isolated data.
 * Run: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const DEPARTMENT_DEFS = [
  { code: "GP",   nameSq: "Mjeku i Përgjithshëm", color: "#6366F1" },
  { code: "PED",  nameSq: "Pediatri",            color: "#10B981" },
  { code: "GYN",  nameSq: "Gjinekologji",        color: "#EC4899" },
  { code: "CARD", nameSq: "Kardiologji",         color: "#EF4444" },
  { code: "DERM", nameSq: "Dermatologji",        color: "#F59E0B" },
  { code: "NEURO",nameSq: "Neurologji",          color: "#8B5CF6" },
  { code: "ORTH", nameSq: "Ortopedi",            color: "#06B6D4" },
  { code: "OPHT", nameSq: "Oftamologji",         color: "#3B82F6" },
  { code: "ENT",  nameSq: "ORL",                 color: "#14B8A6" },
  { code: "URO",  nameSq: "Urologji",            color: "#0EA5E9" },
  { code: "ENDO", nameSq: "Endokrinologji",      color: "#22C55E" },
  { code: "GAST", nameSq: "Gastroenterologji",   color: "#84CC16" },
  { code: "ONC",  nameSq: "Onkologji",           color: "#DC2626" },
  { code: "PSY",  nameSq: "Psikologji & Psikiatri", color: "#A855F7" },
  { code: "PHYS", nameSq: "Fizioterapi",         color: "#F97316" },
  { code: "DENT", nameSq: "Stomatologji",        color: "#0891B2" },
  { code: "BIO",  nameSq: "Biokimi (Lab)",       color: "#6366F1" },
  { code: "MICRO",nameSq: "Mikrobiologji (Lab)", color: "#8B5CF6" },
  { code: "RADIO",nameSq: "Radiologji",          color: "#64748B" },
  { code: "SURG", nameSq: "Kirurgji",            color: "#E11D48" },
];

const SERVICES_LAB = [
  { code: "L-CBC",   name: "Pasqyra e plotë e gjakut (CBC)", price: 8.0 },
  { code: "L-GLU",   name: "Glukoza në gjak",                price: 3.0 },
  { code: "L-CHOL",  name: "Kolesteroli total",              price: 4.0 },
  { code: "L-CREA",  name: "Kreatinina",                     price: 4.0 },
  { code: "L-TSH",   name: "TSH (Tiroide)",                  price: 9.0 },
];

const SERVICES_CONSULT = [
  { code: "C-GP",   name: "Konsulta e mjekut të përgjithshëm",   price: 15.0, dep: "GP",   duration: 20 },
  { code: "C-PED",  name: "Konsulta pediatrike",                 price: 20.0, dep: "PED",  duration: 25 },
  { code: "C-CARD", name: "Konsulta kardiologjike",              price: 30.0, dep: "CARD", duration: 30 },
];

async function seedTenant(tenantData: {
  code: string;
  name: string;
  email: string;
  city: string;
  primaryColor: string;
  plan: string;
  isPlatform?: boolean;
}) {
  console.log(`\n🏥 ${tenantData.name} (${tenantData.code})`);

  const tenant = await prisma.tenant.upsert({
    where: { code: tenantData.code },
    update: {},
    create: {
      code: tenantData.code,
      name: tenantData.name,
      email: tenantData.email,
      city: tenantData.city,
      primaryColor: tenantData.primaryColor,
      plan: tenantData.plan,
      country: "Kosovë",
      isActive: true,
      maxUsers: tenantData.plan === "ENTERPRISE" ? 999 : tenantData.plan === "PRO" ? 20 : 5,
      maxPatients: tenantData.plan === "ENTERPRISE" ? 999999 : tenantData.plan === "PRO" ? 5000 : 500,
    },
  });

  // Departments
  console.log(`  · 20 departments`);
  for (let i = 0; i < DEPARTMENT_DEFS.length; i++) {
    const d = DEPARTMENT_DEFS[i]!;
    await prisma.department.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: d.code } },
      update: {},
      create: {
        tenantId: tenant.id,
        code: d.code,
        name: d.code,
        nameSq: d.nameSq,
        color: d.color,
        sortOrder: i,
      },
    });
  }

  // Users
  console.log(`  · 3 users`);
  const passwordHash = await argon2.hash("1111111111", { type: argon2.argon2id });

  const adminEmail = `admin@${tenantData.code}.sish.local`;
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: adminEmail } },
    update: { passwordHash },
    create: {
      tenantId: tenant.id,
      email: adminEmail,
      passwordHash,
      firstName: "Admin",
      lastName: tenantData.name.split(" ")[0] ?? "SISH",
      role: tenantData.isPlatform ? "SUPER_ADMIN" : "ADMIN",
      emailVerified: new Date(),
    },
  });

  if (!tenantData.isPlatform) {
    const cardDept = await prisma.department.findUnique({
      where: { tenantId_code: { tenantId: tenant.id, code: "CARD" } },
    });
    const bioDept = await prisma.department.findUnique({
      where: { tenantId_code: { tenantId: tenant.id, code: "BIO" } },
    });

    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: `doctor@${tenantData.code}.sish.local` } },
      update: { passwordHash },
      create: {
        tenantId: tenant.id,
        email: `doctor@${tenantData.code}.sish.local`,
        passwordHash,
        firstName: "Arben",
        lastName: "Hoxha",
        role: "DOCTOR",
        departmentId: cardDept?.id,
      },
    });
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: `lab@${tenantData.code}.sish.local` } },
      update: { passwordHash },
      create: {
        tenantId: tenant.id,
        email: `lab@${tenantData.code}.sish.local`,
        passwordHash,
        firstName: "Drita",
        lastName: "Berisha",
        role: "LAB_TECHNICIAN",
        departmentId: bioDept?.id,
      },
    });

    // Services
    console.log(`  · ${SERVICES_LAB.length + SERVICES_CONSULT.length} services`);
    for (const s of SERVICES_LAB) {
      await prisma.service.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: s.code } },
        update: {},
        create: {
          tenantId: tenant.id,
          code: s.code,
          name: s.name,
          type: "LAB_TEST",
          price: s.price,
          departmentId: bioDept?.id,
        },
      });
    }
    for (const s of SERVICES_CONSULT) {
      const dep = await prisma.department.findUnique({
        where: { tenantId_code: { tenantId: tenant.id, code: s.dep } },
      });
      await prisma.service.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: s.code } },
        update: {},
        create: {
          tenantId: tenant.id,
          code: s.code,
          name: s.name,
          type: "CONSULTATION",
          price: s.price,
          duration: s.duration,
          departmentId: dep?.id,
        },
      });
    }

    // Patients (different per tenant — proves isolation)
    const samplePatients = tenantData.code === "klinika-demo"
      ? [
          { fn: "Albini",  ln: "Krasniqi", gender: "MALE",   blood: "A_POS", phone: "+38344111222" },
          { fn: "Erëblina",ln: "Hyseni",   gender: "FEMALE", blood: "O_NEG", phone: "+38344222333" },
          { fn: "Donjeta", ln: "Berisha",  gender: "FEMALE", blood: "B_POS", phone: "+38344333444" },
        ]
      : [
          { fn: "Lulëzime",ln: "Mustafa",  gender: "FEMALE", blood: "A_NEG", phone: "+38344555666" },
          { fn: "Granit",  ln: "Avdiu",    gender: "MALE",   blood: "O_POS", phone: "+38344666777" },
        ];

    console.log(`  · ${samplePatients.length} patients`);
    for (let i = 0; i < samplePatients.length; i++) {
      const p = samplePatients[i]!;
      const code = `P-${new Date().getFullYear()}-${String(i + 1).padStart(5, "0")}`;
      await prisma.patient.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code } },
        update: {},
        create: {
          tenantId: tenant.id,
          code,
          firstName: p.fn,
          lastName: p.ln,
          gender: p.gender,
          bloodType: p.blood,
          phone: p.phone,
          city: tenantData.city,
          country: "Kosovë",
          dateOfBirth: new Date(1980 + i * 3, i % 12, 1 + i),
          createdById: admin.id,
        },
      });
    }
  }

  return tenant;
}

async function main() {
  console.log("🌱 Seeding SISH multi-tenant database…");

  await seedTenant({
    code: "klinika-demo",
    name: "Klinika Demo SISH",
    email: "info@klinikademo.com",
    city: "Prishtinë",
    primaryColor: "#6366F1",
    plan: "PRO",
  });

  await seedTenant({
    code: "spital-rruga",
    name: "Spitali Rruga e Diellit",
    email: "info@spitalirruga.com",
    city: "Prizren",
    primaryColor: "#10B981",
    plan: "ENTERPRISE",
  });

  await seedTenant({
    code: "platform",
    name: "SISH Platform",
    email: "platform@sish.local",
    city: "—",
    primaryColor: "#F59E0B",
    plan: "ENTERPRISE",
    isPlatform: true,
  });

  console.log("\n✅ Seed completed.\n");
  console.log("Demo accounts (password: 1111111111 për të gjithë):");
  console.log("  • admin@klinika-demo.sish.local      (ADMIN @ Klinika Demo · 3 pacientë)");
  console.log("  • doctor@klinika-demo.sish.local     (DOCTOR @ Klinika Demo)");
  console.log("  • admin@spital-rruga.sish.local      (ADMIN @ Spitali Rruga · 2 pacientë të ndryshëm)");
  console.log("  • admin@platform.sish.local          (SUPER_ADMIN — qasje cross-tenant)");
  console.log("");
  console.log("🔒 Test izolimi:");
  console.log("  1. Kyçu si admin@klinika-demo.sish.local → sheh 3 pacientë (Albini, Erëblina, Donjeta)");
  console.log("  2. Kyçu si admin@spital-rruga.sish.local → sheh 2 pacientë të NDRYSHËM (Lulëzime, Granit)");
  console.log("  3. Kyçu si SUPER_ADMIN → sheh të gjithë + faqen /tenants");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
