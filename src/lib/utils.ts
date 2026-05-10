import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string, currency = "EUR"): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n || 0);
}

export function formatNumber(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("sq-AL").format(n || 0);
}

export function formatDate(date: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("sq-AL", opts ?? { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "tani";
  if (minutes < 60) return `${minutes} min më parë`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} orë më parë`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ditë më parë`;
  return formatDate(d);
}

export function calculateAge(dob: Date | string | null | undefined): number | null {
  if (!dob) return null;
  const d = typeof dob === "string" ? new Date(dob) : dob;
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function initials(firstName?: string | null, lastName?: string | null): string {
  const f = (firstName ?? "").trim().charAt(0).toUpperCase();
  const l = (lastName ?? "").trim().charAt(0).toUpperCase();
  return `${f}${l}` || "—";
}

export function generateCode(prefix: string, sequence: number, year = new Date().getFullYear()): string {
  return `${prefix}-${year}-${String(sequence).padStart(5, "0")}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay = 300): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return "—";
  return phone.replace(/(\d{3})(\d{3})(\d+)/, "$1 $2 $3");
}

export function bloodTypeLabel(type: string | null | undefined): string {
  const map: Record<string, string> = {
    A_POS: "A+", A_NEG: "A−",
    B_POS: "B+", B_NEG: "B−",
    AB_POS: "AB+", AB_NEG: "AB−",
    O_POS: "O+", O_NEG: "O−",
    UNKNOWN: "—",
  };
  return map[type ?? "UNKNOWN"] ?? "—";
}

export function genderLabel(g: string | null | undefined): string {
  const map: Record<string, string> = {
    MALE: "Mashkull",
    FEMALE: "Femër",
    OTHER: "Tjetër",
    UNSPECIFIED: "—",
  };
  return map[g ?? "UNSPECIFIED"] ?? "—";
}
