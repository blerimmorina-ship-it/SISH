"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS, type NavItem } from "@/config/nav";
import { SishLogo } from "@/components/brand/logo";
import type { Role } from "@/lib/rbac";

interface SidebarProps {
  role?: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  function canSee(item: NavItem): boolean {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 border-r border-border/60 bg-card/40 backdrop-blur-xl sticky top-0 h-screen">
      <div className="flex h-16 items-center px-6 border-b border-border/60">
        <Link href="/dashboard" className="block">
          <SishLogo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto scroll-thin px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => {
          const visible = section.items.filter(canSee);
          if (visible.length === 0) return null;
          return (
            <div key={section.label}>
              <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                {section.label}
              </div>
              <ul className="space-y-0.5">
                {visible.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href as never}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          "hover:bg-primary/10 hover:text-foreground",
                          active
                            ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.18)_inset]"
                            : "text-muted-foreground",
                        )}
                      >
                        {active && (
                          <span
                            className="absolute left-0 top-1/2 h-6 -translate-y-1/2 w-0.5 rounded-r-full bg-gradient-to-b from-primary to-accent"
                            aria-hidden
                          />
                        )}
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            active ? "text-primary" : "text-muted-foreground/70 group-hover:text-primary",
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            {item.badge}
                          </span>
                        )}
                        {active && <ChevronRight className="h-3.5 w-3.5 text-primary/70" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-4">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 ring-1 ring-primary/10">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Premium</div>
          <div className="text-sm font-medium text-foreground">SISH Cloud Pro</div>
          <div className="mt-1 text-xs text-muted-foreground">Mbështetje 24/7 + raporte të avancuara</div>
        </div>
      </div>
    </aside>
  );
}
