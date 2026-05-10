"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NAV_SECTIONS, type NavItem } from "@/config/nav";
import { SishLogo } from "@/components/brand/logo";
import type { Role } from "@/lib/rbac";

export function MobileNav({ role }: { role?: Role }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function canSee(item: NavItem): boolean {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Hap menynë">
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card/95 backdrop-blur-xl border-r border-border/60 shadow-premium flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex h-16 items-center justify-between px-6 border-b border-border/60">
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <SishLogo />
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Mbyll">
                <X className="h-5 w-5" />
              </Button>
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
                              onClick={() => setOpen(false)}
                              className={cn(
                                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                active
                                  ? "bg-primary/15 text-foreground"
                                  : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                              )}
                            >
                              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground/70")} />
                              <span className="flex-1">{item.label}</span>
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
          </aside>
        </div>
      )}
    </>
  );
}
