"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  start: Date;
  end: Date;
  color?: string;
  groupId?: string; // for column grouping (e.g. operating room)
  href?: string;
  badge?: string;
}

export interface CalendarColumn {
  id: string;
  label: string;
  color?: string;
}

type ViewMode = "day" | "week" | "month" | "list";

interface CalendarViewProps {
  events: CalendarEvent[];
  columns?: CalendarColumn[]; // for column-grouped layouts (e.g. rooms)
  initialDate?: Date;
  initialView?: ViewMode;
  startHour?: number;
  endHour?: number;
  newEventHref?: string;
  onSlotClick?: (date: Date, columnId?: string) => void;
}

const DAYS_SHORT = ["Hënë", "Mar", "Mër", "Enj", "Pre", "Sht", "Diel"];
const MONTHS = [
  "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
  "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor",
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // Monday-first
  x.setDate(x.getDate() - day);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTimeShort(d: Date): string {
  return d.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" });
}

export function CalendarView({
  events,
  columns,
  initialDate = new Date(),
  initialView = "week",
  startHour = 8,
  endHour = 20,
  newEventHref,
  onSlotClick,
}: CalendarViewProps) {
  const [view, setView] = useState<ViewMode>(initialView);
  const [date, setDate] = useState(initialDate);

  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour],
  );

  function navigate(direction: -1 | 0 | 1) {
    if (direction === 0) {
      setDate(new Date());
      return;
    }
    const newDate = new Date(date);
    if (view === "day" || view === "list") newDate.setDate(newDate.getDate() + direction);
    else if (view === "week") newDate.setDate(newDate.getDate() + 7 * direction);
    else newDate.setMonth(newDate.getMonth() + direction);
    setDate(newDate);
  }

  const titleLabel = useMemo(() => {
    if (view === "day") {
      return date.toLocaleDateString("sq-AL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    if (view === "week") {
      const start = startOfWeek(date);
      const end = addDays(start, 6);
      return `${start.getDate()} ${MONTHS[start.getMonth()]} — ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    }
    if (view === "month") return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    return date.toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" });
  }, [date, view]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} aria-label="Mbrapa">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(0)}>
            Sot
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)} aria-label="Para">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h3 className="ml-2 text-base font-semibold capitalize">{titleLabel}</h3>
        </div>
        <div className="flex items-center gap-1">
          <div className="inline-flex rounded-lg bg-muted/40 p-0.5">
            {(["day", "week", "month", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  view === v ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v === "day" && "Dita"}
                {v === "week" && "Java"}
                {v === "month" && "Muaji"}
                {v === "list" && "Lista"}
              </button>
            ))}
          </div>
          {newEventHref && (
            <Button variant="premium" size="sm" asChild className="ml-2">
              <Link href={newEventHref as never}>
                <Plus className="h-4 w-4" /> I ri
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Views */}
      {view === "day" && (
        <DayView events={events} columns={columns} date={date} hours={hours} onSlotClick={onSlotClick} />
      )}
      {view === "week" && <WeekView events={events} date={date} hours={hours} onSlotClick={onSlotClick} />}
      {view === "month" && <MonthView events={events} date={date} />}
      {view === "list" && <ListView events={events} date={date} />}
    </div>
  );
}

/* ─────────────── DAY VIEW ─────────────── */

function DayView({
  events,
  columns,
  date,
  hours,
  onSlotClick,
}: {
  events: CalendarEvent[];
  columns?: CalendarColumn[];
  date: Date;
  hours: number[];
  onSlotClick?: (date: Date, columnId?: string) => void;
}) {
  const dayEvents = events.filter((e) => sameDay(e.start, date));
  const cols = columns ?? [{ id: "default", label: "" }];

  return (
    <div className="rounded-xl border border-border/60 bg-card/30 overflow-hidden">
      <div className="grid" style={{ gridTemplateColumns: `60px repeat(${cols.length}, 1fr)` }}>
        {/* Header */}
        <div className="border-b border-border/40 bg-muted/30 px-2 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          Ora
        </div>
        {cols.map((c) => (
          <div
            key={c.id}
            className="border-b border-l border-border/40 bg-muted/30 px-3 py-2 text-sm font-medium flex items-center gap-2"
          >
            {c.color && <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />}
            {c.label || date.toLocaleDateString("sq-AL", { weekday: "long" })}
          </div>
        ))}

        {/* Time grid */}
        {hours.map((h) => (
          <div key={`row-${h}`} className="contents">
            <div className="border-b border-border/30 px-2 py-3 text-[10px] font-mono text-muted-foreground/70">
              {String(h).padStart(2, "0")}:00
            </div>
            {cols.map((c) => {
              const slotEvents = dayEvents.filter((e) => {
                if (c.id !== "default" && e.groupId !== c.id) return false;
                return e.start.getHours() === h;
              });
              const slotDate = new Date(date);
              slotDate.setHours(h, 0, 0, 0);
              return (
                <div
                  key={`${h}-${c.id}`}
                  onClick={() => onSlotClick?.(slotDate, c.id !== "default" ? c.id : undefined)}
                  className="relative border-b border-l border-border/30 min-h-[64px] hover:bg-primary/5 cursor-pointer transition-colors group"
                >
                  {slotEvents.map((e) => (
                    <EventCard key={e.id} event={e} compact />
                  ))}
                  {slotEvents.length === 0 && (
                    <div className="opacity-0 group-hover:opacity-50 absolute inset-2 border-2 border-dashed border-primary/40 rounded-md flex items-center justify-center">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── WEEK VIEW ─────────────── */

function WeekView({
  events,
  date,
  hours,
  onSlotClick,
}: {
  events: CalendarEvent[];
  date: Date;
  hours: number[];
  onSlotClick?: (date: Date) => void;
}) {
  const weekStart = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  return (
    <div className="rounded-xl border border-border/60 bg-card/30 overflow-hidden">
      <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
        {/* Header */}
        <div className="border-b border-border/40 bg-muted/30 px-2 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          Ora
        </div>
        {days.map((d, i) => {
          const isToday = sameDay(d, today);
          const isWeekend = i >= 5;
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "border-b border-l border-border/40 px-3 py-2 text-sm flex flex-col items-center justify-center",
                isToday && "bg-primary/15 text-primary font-semibold",
                !isToday && isWeekend && "bg-muted/20 text-muted-foreground",
                !isToday && !isWeekend && "bg-muted/30",
              )}
            >
              <div className="text-[10px] uppercase tracking-wider">{DAYS_SHORT[i]}</div>
              <div className={cn("text-base font-bold", isToday && "rounded-full bg-primary text-primary-foreground h-7 w-7 flex items-center justify-center")}>
                {d.getDate()}
              </div>
            </div>
          );
        })}

        {/* Time grid */}
        {hours.map((h) => (
          <div key={`row-${h}`} className="contents">
            <div className="border-b border-border/30 px-2 py-2 text-[10px] font-mono text-muted-foreground/70">
              {String(h).padStart(2, "0")}:00
            </div>
            {days.map((d) => {
              const slotEvents = events.filter((e) => sameDay(e.start, d) && e.start.getHours() === h);
              const slotDate = new Date(d);
              slotDate.setHours(h, 0, 0, 0);
              return (
                <div
                  key={`${h}-${d.toISOString()}`}
                  onClick={() => onSlotClick?.(slotDate)}
                  className="relative border-b border-l border-border/30 min-h-[48px] hover:bg-primary/5 cursor-pointer transition-colors group"
                >
                  {slotEvents.map((e) => (
                    <EventCard key={e.id} event={e} compact />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── MONTH VIEW ─────────────── */

function MonthView({ events, date }: { events: CalendarEvent[]; date: Date }) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const start = startOfWeek(firstOfMonth);
  const totalDays = Math.ceil((lastOfMonth.getDate() + ((firstOfMonth.getDay() + 6) % 7)) / 7) * 7;
  const days = Array.from({ length: totalDays }, (_, i) => addDays(start, i));
  const today = new Date();
  const currentMonth = date.getMonth();

  return (
    <div className="rounded-xl border border-border/60 bg-card/30 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border/40 bg-muted/30">
        {DAYS_SHORT.map((d, i) => (
          <div
            key={d}
            className={cn(
              "px-3 py-2 text-[10px] uppercase tracking-wider text-center",
              i >= 5 ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const isCurrentMonth = d.getMonth() === currentMonth;
          const isToday = sameDay(d, today);
          const dayEvents = events.filter((e) => sameDay(e.start, d));
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "min-h-[100px] border-b border-r border-border/30 p-2 last:border-r-0",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground/50",
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-sm",
                    isToday && "h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold",
                  )}
                >
                  {d.getDate()}
                </span>
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground font-mono">+{dayEvents.length - 3}</span>
                )}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <Link
                    key={e.id}
                    href={(e.href ?? "#") as never}
                    className="block truncate rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: `${e.color ?? "hsl(var(--primary))"}20`, color: e.color ?? "hsl(var(--primary))" }}
                    title={e.title}
                  >
                    {formatTimeShort(e.start)} {e.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── LIST VIEW ─────────────── */

function ListView({ events, date }: { events: CalendarEvent[]; date: Date }) {
  // Show events from `date` onward, grouped by day
  const futureEvents = events
    .filter((e) => e.start >= startOfDay(date))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const grouped = futureEvents.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    const key = e.start.toLocaleDateString("sq-AL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    (acc[key] ??= []).push(e);
    return acc;
  }, {});

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/30 p-12 text-center">
        <CalendarIcon className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">Asnjë ngjarje në periudhën e zgjedhur</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([day, items]) => (
        <div key={day} className="rounded-xl border border-border/60 bg-card/30 overflow-hidden">
          <div className="border-b border-border/40 bg-muted/30 px-5 py-3 flex items-center justify-between">
            <h3 className="font-semibold capitalize">{day}</h3>
            <span className="rounded-full bg-card/60 px-2 py-0.5 text-xs">{items.length}</span>
          </div>
          <ul className="divide-y divide-border/40">
            {items.map((e) => (
              <li key={e.id} className="hover:bg-accent/5">
                <Link
                  href={(e.href ?? "#") as never}
                  className="flex items-center gap-4 px-5 py-3"
                >
                  <div className="w-20 shrink-0">
                    <div className="text-base font-bold tracking-tight">{formatTimeShort(e.start)}</div>
                    <div className="text-[10px] text-muted-foreground">→ {formatTimeShort(e.end)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium" style={{ color: e.color ?? undefined }}>
                      {e.title}
                    </div>
                    {e.subtitle && <div className="text-xs text-muted-foreground">{e.subtitle}</div>}
                  </div>
                  {e.badge && (
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: `${e.color ?? "hsl(var(--primary))"}20`, color: e.color ?? "hsl(var(--primary))" }}>
                      {e.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ─────────────── EVENT CARD ─────────────── */

function EventCard({ event, compact }: { event: CalendarEvent; compact?: boolean }) {
  const color = event.color ?? "hsl(var(--primary))";
  return (
    <Link
      href={(event.href ?? "#") as never}
      className={cn(
        "absolute inset-x-1 top-1 rounded-md border-l-2 px-2 py-1 backdrop-blur-sm hover:scale-[1.02] transition-transform z-10",
        compact ? "text-[11px]" : "text-xs",
      )}
      style={{
        background: `${color}15`,
        borderLeftColor: color,
        color: color,
      }}
    >
      <div className="font-semibold truncate">{formatTimeShort(event.start)} {event.title}</div>
      {event.subtitle && <div className="opacity-80 truncate">{event.subtitle}</div>}
    </Link>
  );
}
