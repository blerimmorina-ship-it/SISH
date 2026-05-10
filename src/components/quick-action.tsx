"use client";

import { useState } from "react";
import { Plus, Stethoscope, UserPlus, TestTube2, FileSignature, CalendarPlus, Receipt } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: CalendarPlus, label: "Termin i ri", href: "/appointments/new", color: "text-primary" },
  { icon: Stethoscope, label: "Vizitë e re", href: "/visits/new", color: "text-success" },
  { icon: UserPlus, label: "Pacient i ri", href: "/patients/new", color: "text-info" },
  { icon: TestTube2, label: "Urdhër laboratorik", href: "/lab/orders/new", color: "text-warning" },
  { icon: Receipt, label: "Faturë e re", href: "/billing/new", color: "text-accent" },
  { icon: FileSignature, label: "Ofertë e re", href: "/quotes/new", color: "text-primary" },
];

export function QuickAction() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="premium" size="sm" className="hidden md:inline-flex">
          <Plus className="h-4 w-4" /> Veprim i shpejtë
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Krijo shpejt</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <DropdownMenuItem key={a.href} asChild>
              <Link href={a.href as never} onClick={() => setOpen(false)}>
                <Icon className={`mr-2 h-4 w-4 ${a.color}`} />
                {a.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
