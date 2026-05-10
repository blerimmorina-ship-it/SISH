import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: number; positive?: boolean; suffix?: string };
  icon?: LucideIcon;
  tone?: "primary" | "accent" | "warning" | "success" | "info" | "destructive";
  description?: string;
  className?: string;
}

const toneClasses = {
  primary: "from-primary/15 to-primary/5 ring-primary/20 [&_.icon-bg]:bg-primary/15 [&_.icon-fg]:text-primary",
  accent: "from-accent/15 to-accent/5 ring-accent/20 [&_.icon-bg]:bg-accent/15 [&_.icon-fg]:text-accent",
  warning: "from-warning/15 to-warning/5 ring-warning/20 [&_.icon-bg]:bg-warning/15 [&_.icon-fg]:text-warning",
  success: "from-success/15 to-success/5 ring-success/20 [&_.icon-bg]:bg-success/15 [&_.icon-fg]:text-success",
  info: "from-info/15 to-info/5 ring-info/20 [&_.icon-bg]:bg-info/15 [&_.icon-fg]:text-info",
  destructive: "from-destructive/15 to-destructive/5 ring-destructive/20 [&_.icon-bg]:bg-destructive/15 [&_.icon-fg]:text-destructive",
};

export function StatCard({ label, value, delta, icon: Icon, tone = "primary", description, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm ring-1 ring-border/60 p-5 transition-all hover:shadow-elegant hover:-translate-y-0.5",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", toneClasses[tone])} aria-hidden />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
            {description && <div className="text-xs text-muted-foreground">{description}</div>}
          </div>
          {Icon && (
            <div className={cn("icon-bg rounded-xl p-2.5")}>
              <Icon className={cn("icon-fg h-5 w-5")} />
            </div>
          )}
        </div>
        {delta && (
          <div className="mt-4 flex items-center gap-1 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
                delta.positive
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {delta.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta.value)}
              {delta.suffix ?? "%"}
            </span>
            <span className="text-muted-foreground">vs muaji i kaluar</span>
          </div>
        )}
      </div>
    </div>
  );
}
