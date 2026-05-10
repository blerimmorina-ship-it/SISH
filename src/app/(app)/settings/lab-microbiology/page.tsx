import { Microscope, Plus, Bug, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Konfig. Mikrobiologjia" };

const TESTS = [
  { name: "Kulturë urinare", incubation: "18-24h", sample: "Urinë mesatare", culture: "MacConkey, CLED" },
  { name: "Kulturë e fytit", incubation: "24-48h", sample: "Tampon i fytit", culture: "Blood agar, MacConkey" },
  { name: "Kulturë e plagës", incubation: "48-72h", sample: "Tampon plage", culture: "Blood agar, Chocolate" },
  { name: "Kulturë e gjakut", incubation: "5-7 ditë", sample: "Gjak (BACTEC)", culture: "BACTEC bottles" },
  { name: "Kulturë e fecesit", incubation: "24-48h", sample: "Feces", culture: "SS, Hektoen, MacConkey" },
  { name: "Kulturë e likidit cerebrospinal", incubation: "48-72h", sample: "LCS", culture: "Blood, Chocolate, MacConkey" },
];

const ANTIBIOTICS = [
  "Ampicilinë", "Amoxicilinë", "Cefalexinë", "Cefuroximë", "Ceftriaxonë",
  "Ciprofloxacin", "Levofloxacin", "Gentamicinë", "Amikacinë",
  "Vancomicinë", "Linezolid", "Eritromicinë", "Klindamicinë",
  "Trimethoprim-Sulfa", "Nitrofurantoin", "Imipenem", "Meropenem",
];

const RESISTANCE = ["S (E ndjeshme)", "I (E ndërmjetme)", "R (Rezistente)"];

export default function LabMicrobiologyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Konfigurimi Mikrobiologjik"
        description="Kulturat, antibiogrami dhe protokollet e laboratorit mikrobiologjik"
        actions={<Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Test i ri</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Microscope className="h-4 w-4 text-primary" /> Kulturat & analizat
          </CardTitle>
          <CardDescription>Testet mikrobiologjike të disponueshme me kohën e inkubacionit</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Testi</th>
                  <th className="px-4 py-3">Mostra</th>
                  <th className="px-4 py-3">Mediumi i kulturës</th>
                  <th className="px-4 py-3">Inkubacioni</th>
                </tr>
              </thead>
              <tbody>
                {TESTS.map((t) => (
                  <tr key={t.name} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.sample}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.culture}</td>
                    <td className="px-4 py-3"><Badge variant="info">{t.incubation}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bug className="h-4 w-4 text-primary" /> Antibiotikët në panelin e antibiogramës
            </CardTitle>
            <CardDescription>{ANTIBIOTICS.length} antibiotikë aktualisht në panelin standard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {ANTIBIOTICS.map((a) => (
                <Badge key={a} variant="outline">{a}</Badge>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-3">
              <Plus className="h-3.5 w-3.5" /> Shto antibiotik
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-primary" /> Klasifikimi i ndjeshmërisë
            </CardTitle>
            <CardDescription>Sipas standardit CLSI/EUCAST</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {RESISTANCE.map((r) => {
              const tone = r.startsWith("S") ? "success" : r.startsWith("I") ? "warning" : "destructive";
              return (
                <div key={r} className={`rounded-lg border border-${tone}/30 bg-${tone}/5 px-4 py-2.5`}>
                  <Badge variant={tone as never}>{r}</Badge>
                </div>
              );
            })}
            <div className="rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground mt-3">
              💡 Sistemi auto-flag-on rezistencat e shumëfishta (MDR) dhe pan-rezistencën (PDR)
              dhe alarmaron menjëherë mjekun përgjegjës.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
