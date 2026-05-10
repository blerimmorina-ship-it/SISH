"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, LogOut, User as UserIcon, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuickAction } from "@/components/quick-action";
import { NotificationsBell } from "@/components/notifications";
import { CommandPalette } from "@/components/command-palette";
import { MobileNav } from "@/components/layout/mobile-nav";
import { initials } from "@/lib/utils";
import { ROLE_LABELS, type Role } from "@/lib/rbac";

interface TopbarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    departmentName?: string | null;
  };
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
    <CommandPalette />
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 backdrop-blur-xl px-4 lg:px-8">
      <MobileNav role={user.role} />
      {/* Search opens command palette */}
      <div className="flex-1 max-w-xl">
        <button
          type="button"
          onClick={() => {
            const ev = new KeyboardEvent("keydown", { key: "k", ctrlKey: true });
            document.dispatchEvent(ev);
          }}
          className="flex h-10 w-full items-center gap-2 rounded-lg border border-input bg-card/60 backdrop-blur px-3 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Kërko pacient, vizitë, faturë…</span>
          <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium">
            Ctrl+K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <QuickAction />

        <NotificationsBell />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent/10 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials(user.firstName, user.lastName)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {ROLE_LABELS[user.role]}
                  {user.departmentName ? ` · ${user.departmentName}` : ""}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" /> Profili im
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" /> Cilësimet
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Dilni
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </>
  );
}
