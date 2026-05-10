import {
  LayoutDashboard,
  Users,
  Stethoscope,
  TestTube2,
  CalendarDays,
  Receipt,
  FileText,
  Wallet,
  PackageSearch,
  Tag,
  PieChart,
  Settings,
  Activity,
  Pill,
  ShieldCheck,
  ScrollText,
  ScanLine,
  FileSignature,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/rbac";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  roles?: Role[];
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Përmbledhje",
    items: [
      {
        label: "Paneli",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Përmbledhje e aktivitetit",
      },
      {
        label: "Aktiviteti",
        href: "/activity",
        icon: Activity,
        description: "Ngjarje dhe regjistër",
      },
    ],
  },
  {
    label: "Klinika",
    items: [
      {
        label: "Pacientët",
        href: "/patients",
        icon: Users,
        description: "Regjistri i pacientëve",
      },
      {
        label: "Vizitat",
        href: "/visits",
        icon: Stethoscope,
        description: "Vizitat dhe konsultat",
      },
      {
        label: "Terminet",
        href: "/appointments",
        icon: CalendarDays,
        description: "Kalendar i takimeve",
      },
      {
        label: "Operacionet",
        href: "/operations",
        icon: ScanLine,
        description: "Sallat dhe operacionet",
      },
      {
        label: "Recetat",
        href: "/prescriptions",
        icon: Pill,
        description: "Recetat mjekësore",
      },
      {
        label: "Shabllonet klinike",
        href: "/clinical-templates",
        icon: ScrollText,
        description: "Fraza të paracaktuara klinike",
      },
      {
        label: "Fletëlëshimet",
        href: "/discharge",
        icon: FileText,
        description: "Fletë-lëshimet e pacientëve",
      },
    ],
  },
  {
    label: "Laboratori",
    items: [
      {
        label: "Urdhrat",
        href: "/lab/orders",
        icon: TestTube2,
        description: "Urdhrat laboratorikë",
      },
      {
        label: "Rezultatet",
        href: "/lab/results",
        icon: ScrollText,
        description: "Rezultatet e analizave",
      },
      {
        label: "Shabllonet",
        href: "/lab/templates",
        icon: FileText,
        description: "Shabllonet e analizave",
      },
    ],
  },
  {
    label: "Financa",
    items: [
      {
        label: "Faturimi",
        href: "/billing",
        icon: Receipt,
        description: "Faturat dhe pagesat",
      },
      {
        label: "Arka",
        href: "/cashbox",
        icon: Wallet,
        description: "Hyrje / dalje arka",
      },
      {
        label: "Stoku",
        href: "/inventory",
        icon: PackageSearch,
        description: "Inventari dhe materialet",
      },
      {
        label: "Ofertat",
        href: "/quotes",
        icon: FileSignature,
        description: "Oferta me aprovim",
      },
      {
        label: "Çmimorja",
        href: "/offers",
        icon: Tag,
        description: "Shërbimet dhe çmimet",
      },
    ],
  },
  {
    label: "Analiza",
    items: [
      {
        label: "Raportet",
        href: "/reports",
        icon: PieChart,
        description: "Raportet financiare & klinike",
      },
    ],
  },
  {
    label: "Administrimi",
    items: [
      {
        label: "Përdoruesit",
        href: "/users",
        icon: ShieldCheck,
        description: "Stafi dhe rolet",
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Workflows",
        href: "/workflows",
        icon: Activity,
        description: "Automatizime të ngjarjeve",
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        label: "Klinikat (Platform)",
        href: "/tenants",
        icon: ShieldCheck,
        description: "Të gjitha klinikat — vetëm SUPER_ADMIN",
        roles: ["SUPER_ADMIN"],
      },
      {
        label: "Cilësimet",
        href: "/settings",
        icon: Settings,
        description: "Konfigurimi i sistemit",
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
];
