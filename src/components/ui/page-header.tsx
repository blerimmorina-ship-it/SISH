import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}

export function PageHeader({ title, description, actions, breadcrumb, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 lg:mb-8 animate-fade-up", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {b.href ? (
                <a href={b.href} className="hover:text-foreground transition-colors">{b.label}</a>
              ) : (
                <span>{b.label}</span>
              )}
              {i < breadcrumb.length - 1 && <span className="text-muted-foreground/40">/</span>}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
