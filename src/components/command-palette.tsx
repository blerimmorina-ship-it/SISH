"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  LayoutDashboard,
  Users,
  Stethoscope,
  TestTube2,
  CalendarDays,
  Receipt,
  FileText,
  Wallet,
  PackageSearch,
  PieChart,
  Settings,
  ShieldCheck,
  Plus,
  Tag,
  ScanLine,
  Activity,
  FileSignature,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PaletteItem {
  label: string;
  href: string;
  icon: React.ElementType;
  group: string;
  keywords?: string[];
}

const ITEMS: PaletteItem[] = [
  { label: "Paneli", href: "/dashboard", icon: LayoutDashboard, group: "Navigjim", keywords: ["home", "dashboard"] },
  { label: "Pacientët", href: "/patients", icon: Users, group: "Navigjim" },
  { label: "Vizitat", href: "/visits", icon: Stethoscope, group: "Navigjim" },
  { label: "Terminet", href: "/appointments", icon: CalendarDays, group: "Navigjim" },
  { label: "Operacionet", href: "/operations", icon: ScanLine, group: "Navigjim" },
  { label: "Urdhrat laboratorikë", href: "/lab/orders", icon: TestTube2, group: "Navigjim" },
  { label: "Rezultatet", href: "/lab/results", icon: FileText, group: "Navigjim" },
  { label: "Faturimi", href: "/billing", icon: Receipt, group: "Navigjim" },
  { label: "Arka", href: "/cashbox", icon: Wallet, group: "Navigjim" },
  { label: "Ofertat", href: "/quotes", icon: FileSignature, group: "Navigjim" },
  { label: "Çmimorja", href: "/offers", icon: Tag, group: "Navigjim" },
  { label: "Stoku", href: "/inventory", icon: PackageSearch, group: "Navigjim" },
  { label: "Fletëlëshimet", href: "/discharge", icon: FileText, group: "Navigjim" },
  { label: "Raportet", href: "/reports", icon: PieChart, group: "Navigjim" },
  { label: "Aktiviteti", href: "/activity", icon: Activity, group: "Navigjim" },
  { label: "Përdoruesit", href: "/users", icon: ShieldCheck, group: "Navigjim" },
  { label: "Cilësimet", href: "/settings", icon: Settings, group: "Navigjim" },
  // Quick actions
  { label: "Shto pacient të ri", href: "/patients/new", icon: Plus, group: "Veprime", keywords: ["pacient", "ri"] },
  { label: "Shto vizitë të re", href: "/visits/new", icon: Plus, group: "Veprime" },
  { label: "Shto termin të ri", href: "/appointments/new", icon: Plus, group: "Veprime" },
  { label: "Shto urdhër laboratorik", href: "/lab/orders/new", icon: Plus, group: "Veprime" },
  { label: "Shto faturë të re", href: "/billing/new", icon: Plus, group: "Veprime" },
  { label: "Shto ofertë të re", href: "/quotes/new", icon: Plus, group: "Veprime" },
  { label: "Shto fletëlëshim të ri", href: "/discharge/new", icon: Plus, group: "Veprime" },
  { label: "Shto përdorues", href: "/users/new", icon: Plus, group: "Veprime" },
  // Reports
  { label: "Raporti Financiar", href: "/reports/financial", icon: PieChart, group: "Raporte" },
  { label: "Raporti Klinik", href: "/reports/clinical", icon: PieChart, group: "Raporte" },
  { label: "Demografia", href: "/reports/demographics", icon: PieChart, group: "Raporte" },
  { label: "Raporti Laboratorik", href: "/reports/lab", icon: PieChart, group: "Raporte" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href as never);
  }

  const grouped = ITEMS.reduce<Record<string, PaletteItem[]>>((acc, it) => {
    (acc[it.group] ??= []).push(it);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-2xl gap-0 overflow-hidden">
        <Command className="bg-transparent" shouldFilter>
          <div className="flex items-center gap-2 border-b border-border/60 px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              placeholder="Kërko ose ekzekuto veprim…"
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto scroll-thin p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              Asnjë rezultat.
            </Command.Empty>
            {Object.entries(grouped).map(([group, items]) => (
              <Command.Group
                key={group}
                heading={group}
                className="mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {items.map((it) => {
                  const Icon = it.icon;
                  return (
                    <Command.Item
                      key={it.href}
                      value={[it.label, ...(it.keywords ?? [])].join(" ")}
                      onSelect={() => go(it.href)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-primary/10 aria-selected:text-foreground"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{it.label}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ))}
          </Command.List>
          <div className="border-t border-border/60 px-4 py-2 text-[10px] text-muted-foreground flex items-center justify-between">
            <span>Përdor ↑↓ për të lëvizur, Enter për të hapur</span>
            <span>Ctrl+K për të hapur kudo</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
