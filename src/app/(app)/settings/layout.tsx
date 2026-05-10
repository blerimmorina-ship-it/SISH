import Link from "next/link";
import {
  Building2,
  Building,
  Bell,
  Palette,
  ShieldCheck,
  Database,
  Plug,
  Globe,
  Mail,
  ScrollText,
  Menu,
  FileBarChart,
  Calendar,
  Clock,
  Wallet,
  Wand2,
  History,
  Languages,
  FileText,
  Sliders,
  FileSignature,
  Layers,
  TestTube2,
  Microscope,
  ClipboardList,
} from "lucide-react";

const SECTIONS = [
  { group: "Konfigurimi", items: [
    { href: "/settings", icon: Building2, label: "Të dhënat e biznesit" },
    { href: "/settings/departments", icon: Building, label: "Departamentet" },
    { href: "/settings/services", icon: FileText, label: "Shërbimet & çmimet" },
    { href: "/settings/menus", icon: Menu, label: "Menutë" },
    { href: "/settings/reports", icon: FileBarChart, label: "Konfigurimi i raporteve" },
    { href: "/settings/patient-fields", icon: Calendar, label: "Pacient/Vizita" },
    { href: "/settings/work-hours", icon: Clock, label: "Orari i punës" },
    { href: "/settings/payment", icon: Wallet, label: "Pagesa & TVSH" },
    { href: "/settings/security", icon: ShieldCheck, label: "Siguria & rolet" },
    { href: "/settings/notifications", icon: Bell, label: "Njoftimet (SMS/Email)" },
    { href: "/settings/data", icon: Database, label: "Importet & Eksportet" },
    { href: "/settings/subscription", icon: Wand2, label: "Abonimet" },
    { href: "/settings/locale", icon: Languages, label: "Lokalizimi" },
    { href: "/settings/other", icon: Sliders, label: "Të tjera" },
    { href: "/settings/referrers", icon: ScrollText, label: "Referuesit" },
    { href: "/settings/audit", icon: History, label: "Historiku" },
  ]},
  { group: "Brendi & Integrime", items: [
    { href: "/settings/brand", icon: Palette, label: "Brendi & pamja" },
    { href: "/settings/integrations", icon: Plug, label: "Integrimet" },
    { href: "/settings/locations", icon: Globe, label: "Lokacionet" },
    { href: "/settings/email-templates", icon: Mail, label: "Shabllonet email/SMS" },
  ]},
  { group: "Të dhëna mjekësore", items: [
    { href: "/settings/translations", icon: Languages, label: "Përkthimet" },
    { href: "/settings/discharge-templates", icon: FileText, label: "Shabllone fletëlëshimi" },
    { href: "/settings/quote-terms", icon: FileSignature, label: "Kushtet e ofertës" },
    { href: "/clinical-templates", icon: ClipboardList, label: "Anamnezat (klinike)" },
    { href: "/settings/department-units", icon: Layers, label: "Njësitë e departamenteve" },
  ]},
  { group: "Konfigurim laboratorik", items: [
    { href: "/settings/lab-biochemistry", icon: TestTube2, label: "Biokimia" },
    { href: "/settings/lab-microbiology", icon: Microscope, label: "Mikrobiologjia" },
  ]},
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
        {SECTIONS.map((s) => (
          <div key={s.group}>
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              {s.group}
            </div>
            <ul className="space-y-0.5">
              {s.items.map((it) => {
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href as never}
                      className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary" />
                      <span>{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
