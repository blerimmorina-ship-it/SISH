import Link from "next/link";
import {
  Plus,
  AlertCircle,
  Stethoscope,
  ClipboardList,
  Pill,
  TestTube2,
  MessageCircle,
  CheckCircle2,
  StickyNote,
  FileText,
} from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Shabllonet klinike" };
export const dynamic = "force-dynamic";

const CATEGORIES = [
  { code: "SYMPTOM", label: "Ankesat / Simptomat", icon: AlertCircle, tone: "warning" },
  { code: "EXAM", label: "Ekzaminimet", icon: Stethoscope, tone: "primary" },
  { code: "DIAGNOSIS", label: "Diagnozat", icon: ClipboardList, tone: "destructive" },
  { code: "THERAPY", label: "Terapitë", icon: Pill, tone: "success" },
  { code: "ANALYSIS", label: "Analizat e kërkuara", icon: TestTube2, tone: "info" },
  { code: "ADVICE", label: "Këshillat për pacientin", icon: MessageCircle, tone: "accent" },
  { code: "CONTROL", label: "Kontrollat e ardhshme", icon: CheckCircle2, tone: "success" },
  { code: "NOTE", label: "Shënime klinike", icon: StickyNote, tone: "secondary" },
];

const TONE: Record<string, string> = {
  warning: "from-warning/15 to-warning/5 ring-warning/20 [&_svg]:text-warning",
  primary: "from-primary/15 to-primary/5 ring-primary/20 [&_svg]:text-primary",
  destructive: "from-destructive/15 to-destructive/5 ring-destructive/20 [&_svg]:text-destructive",
  success: "from-success/15 to-success/5 ring-success/20 [&_svg]:text-success",
  info: "from-info/15 to-info/5 ring-info/20 [&_svg]:text-info",
  accent: "from-accent/15 to-accent/5 ring-accent/20 [&_svg]:text-accent",
  secondary: "from-secondary to-secondary/30 ring-border/40 [&_svg]:text-muted-foreground",
};

export default async function ClinicalTemplatesPage() {
  const db = await getDb();
  const templates = await db.clinicalTemplate.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });

  const grouped = CATEGORIES.map((c) => ({
    ...c,
    items: templates.filter((t) => t.category === c.code),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shabllonet Klinike"
        description="Fraza të paracaktuara që mjekët mund t'i futin shpejt gjatë vizitës"
        breadcrumb={[{ label: "Klinika" }, { label: "Shabllonet" }]}
        actions={
          <Button variant="premium" size="sm" asChild>
            <Link href="/clinical-templates/new"><Plus className="h-4 w-4" /> Shabllon i ri</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {grouped.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.code} className={`relative overflow-hidden ring-1 ${TONE[c.tone]}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${TONE[c.tone]} opacity-50 pointer-events-none`} />
              <CardContent className="relative p-5">
                <div className="rounded-xl bg-background/40 backdrop-blur p-2.5 w-fit mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold text-sm">{c.label}</div>
                <div className="mt-1 text-2xl font-bold tracking-tight">{c.items.length}</div>
                <div className="text-xs text-muted-foreground">shabllone</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={FileText}
              title="Asnjë shabllon klinik akoma"
              description="Krijo fraza të paracaktuara për simptoma, ekzaminime, diagnoza, terapi etj. që mjekët t'i përdorin shpejt gjatë vizitave."
              action={
                <Button variant="premium" size="sm" asChild>
                  <Link href="/clinical-templates/new"><Plus className="h-4 w-4" /> Krijo të parën</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.filter((g) => g.items.length > 0).map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.code}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/30">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Icon className="h-4 w-4" />
                      {c.label}
                    </h3>
                    <Badge variant="outline">{c.items.length}</Badge>
                  </div>
                  <ul className="divide-y divide-border/40">
                    {c.items.map((t) => (
                      <li key={t.id} className="px-5 py-3 hover:bg-accent/5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{t.title}</span>
                            {t.shortcut && (
                              <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{t.shortcut}</code>
                            )}
                            {t.icd10 && <Badge variant="info">ICD-10: {t.icd10}</Badge>}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{t.body}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
