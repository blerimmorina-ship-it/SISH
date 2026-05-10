import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, Calendar, AlertOctagon, Sparkles, Globe } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { isCrossTenantRole } from "@/lib/rbac";
import { formatDate, formatRelative } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Klinikat (Platform)" };
export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const session = await getCurrentSession();
  if (!isCrossTenantRole(session?.role)) redirect("/dashboard");

  // SUPER_ADMIN cross-tenant view — uses prisma directly (bypasses scoping)
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          users: true,
          patients: true,
          visits: true,
          invoices: true,
        },
      },
    },
  });

  const planTone: Record<string, "secondary" | "info" | "warning" | "success"> = {
    STARTER: "secondary",
    PRO: "info",
    ENTERPRISE: "success",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Klinikat (Platform)"
        description="Pamje cross-tenant për administratorin e platformës — të gjitha klinikat që përdorin SISH"
        breadcrumb={[{ label: "Platform" }, { label: "Klinikat" }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Klinika gjithsej" value={tenants.length} icon={Building2} tone="primary" />
        <Stat label="Aktive" value={tenants.filter((t) => t.isActive).length} icon={Sparkles} tone="success" />
        <Stat
          label="Përdorues total"
          value={tenants.reduce((s, t) => s + t._count.users, 0)}
          icon={Users}
          tone="info"
        />
        <Stat
          label="Pacientë total"
          value={tenants.reduce((s, t) => s + t._count.patients, 0)}
          icon={Users}
          tone="accent"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Klinika</th>
                  <th className="px-4 py-3">Subdomain</th>
                  <th className="px-4 py-3">Plani</th>
                  <th className="px-4 py-3 text-right">Përdorues</th>
                  <th className="px-4 py-3 text-right">Pacientë</th>
                  <th className="px-4 py-3 text-right">Vizita</th>
                  <th className="px-4 py-3 text-right">Fatura</th>
                  <th className="px-4 py-3">Trial</th>
                  <th className="px-4 py-3">Krijuar</th>
                  <th className="px-4 py-3">Statusi</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => {
                  const isExpired = t.trialEndsAt && new Date(t.trialEndsAt) < new Date();
                  return (
                    <tr key={t.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {t.primaryColor && (
                            <span className="h-3 w-3 rounded-full" style={{ background: t.primaryColor }} />
                          )}
                          <div>
                            <div className="font-medium">{t.name}</div>
                            {t.city && <div className="text-xs text-muted-foreground">{t.city}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          <Globe className="inline h-3 w-3 mr-1" />
                          {t.code}.sish.app
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={planTone[t.plan] ?? "secondary"}>{t.plan}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {t._count.users} <span className="text-muted-foreground">/ {t.maxUsers}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {t._count.patients} <span className="text-muted-foreground">/ {t.maxPatients}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">{t._count.visits}</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">{t._count.invoices}</td>
                      <td className="px-4 py-3 text-xs">
                        {t.trialEndsAt ? (
                          isExpired ? (
                            <Badge variant="destructive">
                              <AlertOctagon className="h-3 w-3" /> Skaduar
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">deri {formatDate(t.trialEndsAt)}</span>
                          )
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {formatRelative(t.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {t.isActive ? <Badge variant="success">Aktive</Badge> : <Badge variant="destructive">Pezulluar</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Si funksionon izolimi i të dhënave?</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                SISH përdor <strong className="text-foreground">Row-Level Multi-Tenancy</strong>. Çdo rekord (pacientë, vizita, fatura, etj.) ka kolonën <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono">tenantId</code>. Prisma Client Extension auto-injects filtrin <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono">{"{ tenantId }"}</code> në çdo query, kështu që klinikat NUK mund t'i shohin të dhënat e njëra-tjetrës.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong className="text-foreground">SUPER_ADMIN</strong> (ti tani) është i vetmi rol që mund të kalojë cross-tenant për mbështetje teknike.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ElementType; tone: string }) {
  const tones: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 [&_.tone]:text-primary",
    success: "from-success/15 to-success/5 [&_.tone]:text-success",
    info: "from-info/15 to-info/5 [&_.tone]:text-info",
    accent: "from-accent/15 to-accent/5 [&_.tone]:text-accent",
  };
  return (
    <div className={`rounded-xl bg-gradient-to-br ${tones[tone]} border border-border/40 p-5`}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="tone h-4 w-4" />
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight tone">{value.toLocaleString("sq-AL")}</div>
    </div>
  );
}
