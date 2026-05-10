import { TestTube2, Plus, Beaker, Cog } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Konfig. Biokimia" };

const PANELS = [
  { name: "Hemogrami i plotë (CBC)", params: 6, sample: "Gjak (EDTA)", machine: "Hematology Analyzer" },
  { name: "Profil lipidik", params: 4, sample: "Serum", machine: "Chemistry Analyzer" },
  { name: "Glikemia", params: 2, sample: "Plazma", machine: "Chemistry Analyzer" },
  { name: "Funksioni renal", params: 3, sample: "Serum", machine: "Chemistry Analyzer" },
  { name: "Funksioni hepatik", params: 5, sample: "Serum", machine: "Chemistry Analyzer" },
  { name: "Hormonet tiroide", params: 3, sample: "Serum", machine: "Immunoassay" },
  { name: "Markera kardiakë", params: 4, sample: "Serum", machine: "Immunoassay" },
  { name: "Analiza e urinës", params: 10, sample: "Urinë", machine: "Urine Analyzer" },
];

const SAMPLE_TYPES = [
  { code: "EDTA", label: "Gjak EDTA (vakum violetë)", color: "#8B5CF6" },
  { code: "SST", label: "Serum (vakum verdhë)", color: "#EAB308" },
  { code: "HEP", label: "Heparin (vakum jeshile)", color: "#10B981" },
  { code: "CIT", label: "Citrati (vakum blu)", color: "#3B82F6" },
  { code: "URI", label: "Urinë", color: "#F59E0B" },
  { code: "STO", label: "Feces", color: "#A16207" },
];

export default function LabBiochemistryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Konfigurimi Biokimik"
        description="Panelet, mostrat dhe makinat e laboratorit biokimik"
        actions={<Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Panel i ri</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TestTube2 className="h-4 w-4 text-primary" /> Panelet e analizave
            </CardTitle>
            <CardDescription>Grupe analizash që kërkohen së bashku</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border/40">
              {PANELS.map((p) => (
                <li key={p.name} className="flex items-center justify-between px-5 py-3 hover:bg-accent/5">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.machine} · Mostra: {p.sample}
                    </div>
                  </div>
                  <Badge variant="outline">{p.params} parametra</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Beaker className="h-4 w-4 text-primary" /> Tipet e mostrave
            </CardTitle>
            <CardDescription>Tubat dhe kontainerët e disponueshëm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {SAMPLE_TYPES.map((s) => (
              <div key={s.code} className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 px-3 py-2">
                <div className="h-8 w-2 rounded-full" style={{ background: s.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{s.code}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cog className="h-4 w-4 text-primary" /> Cilësimet e procesit
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">SLA për analizat rutinë (orë)</Label>
            <Input type="number" defaultValue={4} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">SLA për analizat urgjente (orë)</Label>
            <Input type="number" defaultValue={1} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">SLA për STAT (minuta)</Label>
            <Input type="number" defaultValue={30} />
          </div>
          <label className="md:col-span-3 flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input text-primary" />
            <span>Auto-flag rezultate jashtë diapazonit referent</span>
          </label>
          <label className="md:col-span-3 flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input text-primary" />
            <span>Njofto mjekun menjëherë për rezultate kritike (CRITICAL)</span>
          </label>
          <label className="md:col-span-3 flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded border-input text-primary" />
            <span>Kërko verifikim të dyfishtë para finalizimit (peer review)</span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
