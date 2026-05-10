import { Activity } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatDateTime, formatRelative } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Aktiviteti" };
export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, { label: string; variant: "info" | "warning" | "success" | "destructive" | "secondary" }> = {
  CREATE: { label: "Krijuar", variant: "success" },
  UPDATE: { label: "Përditësuar", variant: "info" },
  DELETE: { label: "Fshirë", variant: "destructive" },
  VIEW: { label: "Shikuar", variant: "secondary" },
  LOGIN: { label: "Hyrje", variant: "info" },
  LOGOUT: { label: "Dalje", variant: "secondary" },
  LOGIN_FAILED: { label: "Hyrje e dështuar", variant: "destructive" },
  EXPORT: { label: "Eksport", variant: "warning" },
  PRINT: { label: "Printim", variant: "warning" },
};

export default async function ActivityPage() {
  const db = await getDb();
  const logs = await db.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aktiviteti"
        description="Regjistër i të gjitha veprimeve në sistem"
        breadcrumb={[{ label: "Përmbledhje" }, { label: "Aktiviteti" }]}
      />

      {logs.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState icon={Activity} title="Asnjë aktivitet i regjistruar akoma" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border/40">
              {logs.map((log) => {
                const a = ACTION_LABELS[log.action] ?? { label: log.action, variant: "secondary" as const };
                return (
                  <li key={log.id} className="flex items-center gap-4 px-5 py-3 hover:bg-accent/5">
                    <Badge variant={a.variant}>{a.label}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">
                          {log.user ? `${log.user.firstName} ${log.user.lastName}` : "—"}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {a.label.toLowerCase()} {log.entityType}
                          {log.entityId ? ` #${log.entityId.slice(-6)}` : ""}
                        </span>
                      </div>
                      {log.ipAddress && (
                        <div className="text-[11px] text-muted-foreground">IP: {log.ipAddress}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{formatRelative(log.createdAt)}</div>
                      <div className="text-[10px] text-muted-foreground/70">{formatDateTime(log.createdAt)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
