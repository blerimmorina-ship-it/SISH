// Adds tenantId field + relation to all top-level data models
const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
let schema = fs.readFileSync(schemaPath, "utf8");

// Models that need tenantId directly (top-level entities)
const MODELS = [
  "Service",
  "Visit",
  "LabOrder",
  "Appointment",
  "Invoice",
  "Prescription",
  "Document",
  "AuditLog",
  "Setting",
  "Quote",
  "OperatingRoom",
  "Surgery",
  "Supplier",
  "Warehouse",
  "ProductCategory",
  "Product",
  "Purchase",
  "CashboxSession",
  "DischargeSheet",
  "ClinicalTemplate",
  "Workflow",
];

const TENANT_FIELDS = `  tenantId        String
  tenant          Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
`;

let updated = 0;
for (const model of MODELS) {
  // Skip if already has tenantId
  const modelRegex = new RegExp(`^model ${model} \\{[\\s\\S]*?\\n\\}`, "m");
  const match = schema.match(modelRegex);
  if (!match) {
    console.log(`  ⏭  ${model}: not found`);
    continue;
  }
  if (match[0].includes("tenantId")) {
    console.log(`  ✓  ${model}: already has tenantId`);
    continue;
  }

  // Insert tenantId after the id line
  const newBlock = match[0].replace(
    /(\s*id\s+String\s+@id @default\(cuid\(\)\)\n)/,
    `$1${TENANT_FIELDS}`,
  );

  // Add @@index([tenantId]) before the closing brace if not present
  const finalBlock = newBlock.replace(
    /(\n)\}$/,
    `\n  @@index([tenantId])$1}`,
  );

  schema = schema.replace(match[0], finalBlock);
  updated++;
  console.log(`  + ${model}: added tenantId`);
}

// Special-case unique constraints that need tenant scoping
const uniqueReplacements = [
  // Service code unique → unique per tenant
  [/(model Service \{[\s\S]*?)code\s+String\s+@unique/, "$1code         String"],
  // Visit code
  [/(model Visit \{[\s\S]*?)code\s+String\s+@unique/, "$1code         String"],
  // LabOrder code
  [/(model LabOrder \{[\s\S]*?)code\s+String\s+@unique\s+/, "$1code            String\n  "],
  // Appointment code
  [/(model Appointment \{[\s\S]*?)code\s+String\s+@unique/, "$1code         String"],
  // Invoice number
  [/(model Invoice \{[\s\S]*?)number\s+String\s+@unique/, "$1number        String"],
  // Prescription code
  [/(model Prescription \{[\s\S]*?)code\s+String\s+@unique/, "$1code         String"],
  // Quote code
  [/(model Quote \{[\s\S]*?)code\s+String\s+@unique/, "$1code         String"],
  // OperatingRoom code
  [/(model OperatingRoom \{[\s\S]*?)code\s+String\s+@unique/, "$1code         String"],
  // Surgery code
  [/(model Surgery \{[\s\S]*?)code\s+String\s+@unique/, "$1code         String"],
  // Warehouse code
  [/(model Warehouse \{[\s\S]*?)code\s+String\s+@unique/, "$1code         String"],
  // Product code
  [/(model Product \{[\s\S]*?)code\s+String\s+@unique/, "$1code         String"],
  // Purchase number
  [/(model Purchase \{[\s\S]*?)number\s+String\s+@unique/, "$1number        String"],
  // DischargeSheet number
  [/(model DischargeSheet \{[\s\S]*?)number\s+String\s+@unique/, "$1number        String"],
  // Setting key was @id - leave as is (composite would need rework). Add tenantId scope manually.
];

for (const [pattern, replacement] of uniqueReplacements) {
  schema = schema.replace(pattern, replacement);
}

// Add @@unique([tenantId, code]) etc. before existing @@index([tenantId])
const compositeUniques = [
  ["Service", "code"],
  ["Visit", "code"],
  ["LabOrder", "code"],
  ["Appointment", "code"],
  ["Invoice", "number"],
  ["Prescription", "code"],
  ["Quote", "code"],
  ["OperatingRoom", "code"],
  ["Surgery", "code"],
  ["Warehouse", "code"],
  ["Product", "code"],
  ["Purchase", "number"],
  ["DischargeSheet", "number"],
];

for (const [model, field] of compositeUniques) {
  const re = new RegExp(`(model ${model} \\{[\\s\\S]*?)(  @@index\\(\\[tenantId\\]\\)\\n\\})`);
  schema = schema.replace(re, `$1  @@unique([tenantId, ${field}])\n$2`);
}

fs.writeFileSync(schemaPath, schema);
console.log(`\n✅ Updated ${updated} models with tenantId`);
