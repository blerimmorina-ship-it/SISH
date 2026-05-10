"use client";

import { useState } from "react";
import {
  Bell,
  TestTube2,
  Receipt,
  CalendarDays,
  AlertOctagon,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  type: "info" | "success" | "warning" | "destructive";
  unread: boolean;
}

// Demo notifications — wire to real API later
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: AlertOctagon,
    title: "Rezultat kritik",
    description: "Glukoza e Albini Krasniqi është mbi diapazonin e lejuar.",
    time: "10 min më parë",
    type: "destructive",
    unread: true,
  },
  {
    id: "2",
    icon: TestTube2,
    title: "Urdhër i ri",
    description: "Drita ka kërkuar 5 analiza biokimike për Donjeta Berisha.",
    time: "30 min më parë",
    type: "info",
    unread: true,
  },
  {
    id: "3",
    icon: CalendarDays,
    title: "Termin i konfirmuar",
    description: "Pacienti Granit Avdiu ka konfirmuar terminin për nesër në 10:00.",
    time: "1 orë më parë",
    type: "success",
    unread: false,
  },
  {
    id: "4",
    icon: Receipt,
    title: "Faturë e paguar",
    description: "Fatura INV-2026-00012 (€85.00) është paguar plotësisht.",
    time: "3 orë më parë",
    type: "success",
    unread: false,
  },
  {
    id: "5",
    icon: CheckCircle2,
    title: "Backup i suksesshëm",
    description: "Të dhënat u rezervuan automatikisht në cloud.",
    time: "Sot · 03:00",
    type: "info",
    unread: false,
  },
];

const TONE: Record<string, string> = {
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = DEMO_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Njoftimet">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Njoftimet</div>
            <div className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} të palexuara` : "Të gjitha të lexuara"}
            </div>
          </div>
          <button className="text-xs text-primary hover:underline">Shëno të gjitha si lexuar</button>
        </div>
        <div className="max-h-[400px] overflow-y-auto scroll-thin">
          {DEMO_NOTIFICATIONS.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Asnjë njoftim</div>
          ) : (
            DEMO_NOTIFICATIONS.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-accent/5 transition-colors cursor-pointer ${
                    n.unread ? "bg-primary/5" : ""
                  } border-b border-border/30 last:border-b-0`}
                >
                  <div className={`shrink-0 rounded-lg p-2 ${TONE[n.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{n.title}</div>
                      {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{n.description}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground/70">{n.time}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="border-t border-border/60 p-2">
          <Button variant="ghost" size="sm" className="w-full">
            Shih të gjitha njoftimet
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
