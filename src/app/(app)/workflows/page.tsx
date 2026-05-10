import Link from "next/link";
import { Plus, Workflow, Zap, Bell, Calendar, AlertOctagon, Receipt, TestTube2 } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Workflows" };
export const dynamic = "force-dynamic";

const SUGGESTED_TRIGGERS = [
  { trigger: "APPT_TOMORROW", icon: Calendar, label: "Kujtues termini 24h", description: "Dërgo SMS pacientit një ditë para terminit", tone: "info" },
  { trigger: "LAB_RESULT_CRITICAL", icon: AlertOctagon, label: "Alarmim rezultati kritik", description: "Njofto mjekun menjëherë kur një rezultat është kritik", tone: "destructive" },
  { trigger: "INVOICE_OVERDUE", icon: Receipt, label: "Faturë e papaguar", description: "Kujtues automatik për pacientët me borxh > 7 ditë", tone: "warning" },
  { trigger: "VISIT_COMPLETED", icon: Bell, label: "Pas vizitës — feedback", description: "Dërgo email me link për vlerësim 24h pas vizitës", tone: "primary" },
  { trigger: "LAB_ORDERED", icon: TestTube2, label: "Pas urdhrit lab", description: "Krijo automatikisht faturën për analizat", tone: "accent" },
  { trigger: "NEW_PATIENT", icon: Workflow, label: "Mirëseardhje pacient i ri", description: "Email mirëseardhje + kartelë", tone: "success" },
];

const TONE: Record<string, string> = {
  info: "from-info/15 to-info/5 [&_svg]:text-info",
  destructive: "from-destructive/15 to-destructive/5 [&_svg]:text-destructive",
  warning: "from-warning/15 to-warning/5 [&_svg]:text-warning",
  primary: "from-primary/15 to-primary/5 [&_svg]:text-primary",
  accent: "from-accent/15 to-accent/5 [&_svg]:text-accent",
  success: "from-success/15 to-success/5 [&_svg]:text-success",
};

export default async function WorkflowsPage() {
  const db = await getDb();
  const workflows = await db.workflow.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflows"
        description="Automatizo veprime kur ndodhin ngjarje në sistem"
        breadcrumb={[{ label: "Administrimi" }, { label: "Workflows" }]}
        actions={
          <Button variant="premium" size="sm">
            <Plus className="h-4 w-4" /> Workflow i ri
          </Button>
        }
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Zap className="h-4 w-4" /> Shabllone të sugjeruara
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SUGGESTED_TRIGGERS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.trigger} className="card-hover">
                <CardContent className="p-5">
                  <div className={`relative rounded-xl p-2.5 w-fit mb-3 bg-gradient-to-br ${TONE[s.tone]} ring-1 ring-border/40`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm">{s.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                  <Button variant="ghost" size="sm" className="mt-3 w-full">
                    <Plus className="h-3.5 w-3.5" /> Aktivizo
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Workflows aktivë ({workflows.filter((w) => w.isActive).length})
        </h2>
        {workflows.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                icon={Workflow}
                title="Asnjë workflow aktiv"
                description="Aktivizo një nga shabllonet e sugjeruara më lart ose krijo një workflow të personalizuar."
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border/40">
                {workflows.map((w) => (
                  <li key={w.id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{w.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{w.trigger}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {w.isActive ? <Badge variant="success">Aktiv</Badge> : <Badge variant="muted">Pasiv</Badge>}
                      <Button variant="ghost" size="sm">Konfiguro</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
