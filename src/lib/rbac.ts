// Client-safe RBAC constants and helpers (no server-only imports).

export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "DOCTOR"
  | "LAB_TECHNICIAN"
  | "RECEPTIONIST"
  | "ACCOUNTANT"
  | "NURSE"
  | "VIEWER";

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrator",
  DOCTOR: "Mjek",
  LAB_TECHNICIAN: "Laborant",
  RECEPTIONIST: "Recepsioniste",
  ACCOUNTANT: "Kontabilist",
  NURSE: "Infermiere",
  VIEWER: "Vëzhgues",
};

export const PERMISSIONS = {
  PATIENTS_VIEW: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "LAB_TECHNICIAN", "ACCOUNTANT", "VIEWER"],
  PATIENTS_EDIT: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE"],
  PATIENTS_DELETE: ["SUPER_ADMIN", "ADMIN"],
  VISITS_VIEW: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "ACCOUNTANT", "VIEWER"],
  VISITS_EDIT: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE"],
  APPOINTMENTS_VIEW: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "ACCOUNTANT", "VIEWER"],
  APPOINTMENTS_EDIT: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE"],
  QUOTES_VIEW: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "ACCOUNTANT", "VIEWER"],
  QUOTES_EDIT: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "ACCOUNTANT"],
  CASHBOX_VIEW: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "RECEPTIONIST"],
  CASHBOX_EDIT: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "RECEPTIONIST"],
  LAB_VIEW: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "LAB_TECHNICIAN", "VIEWER"],
  LAB_EDIT: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "LAB_TECHNICIAN"],
  BILLING_VIEW: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "RECEPTIONIST"],
  BILLING_EDIT: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
  USERS_MANAGE: ["SUPER_ADMIN", "ADMIN"],
  REPORTS_VIEW: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "ACCOUNTANT"],
  SETTINGS: ["SUPER_ADMIN", "ADMIN"],
  // Cross-tenant operations — only SUPER_ADMIN
  TENANTS_MANAGE: ["SUPER_ADMIN"],
} as const;

export function hasPermission(role: Role | string | undefined | null, permission: keyof typeof PERMISSIONS): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

/** SUPER_ADMIN can see across all tenants. Everyone else is bound to their tenant. */
export function isCrossTenantRole(role: Role | string | undefined | null): boolean {
  return role === "SUPER_ADMIN";
}
