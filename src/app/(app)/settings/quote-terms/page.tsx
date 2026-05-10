import { FileSignature, Save, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Kushtet e ofertës" };

const DEFAULT_TERMS = `1. Vlefshmëria
Kjo ofertë është e vlefshme për {{validity_days}} ditë nga data e lëshimit, përveç nëse specifikohet ndryshe me shkrim.

2. Çmimet
Të gjithë çmimet janë në Euro (€) dhe nuk përfshijnë taksa shtesë përveç TVSH-së kur është e aplikueshme.

3. Pagesa
Pagesa kryhet sipas marrëveshjes — kesh, kartë ose transfertë bankare. Pagesat me këste janë në dispozicion për shërbime > 500€.

4. Anulimi
Pacienti ka të drejtë të anulojë ofertën pa pagesë para fillimit të trajtimit. Pas fillimit, aplikohen kushte specifike sipas shërbimit.

5. Konfidencialiteti
Të gjitha të dhënat mjekësore trajtohen sipas Ligjit për Mbrojtjen e të Dhënave Personale dhe rregullores GDPR.

6. Ndryshime
Klinika ruan të drejtën të ndryshojë termat me njoftim paraprak të paktën 30 ditësh.`;

const PRESETS = [
  { name: "Termat standardë", description: "Përdoret për shumicën e ofertave të zakonshme", isDefault: true },
  { name: "Pakot e dentistrisë", description: "Specifike për oferta stomatologjike komplekse" },
  { name: "Pakot estetike", description: "Termat për procedurat estetike dhe rikthime" },
  { name: "Operacione kirurgjikale", description: "Përfshin marrëveshje për pre-op dhe post-op" },
];

export default function QuoteTermsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kushtet e ofertës"
        description="Termat dhe kushtet ligjore që shfaqen në çdo ofertë të lëshuar"
        actions={<Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Shabllon i ri</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSignature className="h-4 w-4 text-primary" /> Shabllonet e termave
          </CardTitle>
          <CardDescription>Mjekët mund të zgjedhin njërin kur lëshojnë një ofertë</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border/40">
            {PRESETS.map((p) => (
              <li key={p.name} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.name}</span>
                    {p.isDefault && (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                        I parazgjedhur
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.description}</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">Edito</Button>
                  {!p.isDefault && (
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editori — Termat standardë</CardTitle>
          <CardDescription>Përdor variabla si <code className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono">{"{{validity_days}}"}</code> që zëvendësohen automatikisht</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-1.5 text-xs">Titulli i shabllonit</Label>
            <Input defaultValue="Termat standardë të ofertës" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Përshkrimi i brendshëm</Label>
            <Input defaultValue="Përdoret për shumicën e ofertave të zakonshme" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Teksti ligjor</Label>
            <textarea
              defaultValue={DEFAULT_TERMS}
              rows={20}
              className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            💡 <strong>Variabla të disponueshme:</strong>{" "}
            <code className="rounded bg-card px-1 py-0.5 mr-1">{"{{validity_days}}"}</code>
            <code className="rounded bg-card px-1 py-0.5 mr-1">{"{{clinic_name}}"}</code>
            <code className="rounded bg-card px-1 py-0.5 mr-1">{"{{patient_name}}"}</code>
            <code className="rounded bg-card px-1 py-0.5 mr-1">{"{{quote_total}}"}</code>
            <code className="rounded bg-card px-1 py-0.5">{"{{currency}}"}</code>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium"><Save className="h-4 w-4" /> Ruaj termat</Button>
      </div>
    </div>
  );
}
