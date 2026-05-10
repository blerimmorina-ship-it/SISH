import { Languages, Plus, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Përkthimet" };

const SAMPLES = [
  { key: "common.save", sq: "Ruaj", en: "Save", sr: "Sačuvaj" },
  { key: "common.cancel", sq: "Anulo", en: "Cancel", sr: "Otkaži" },
  { key: "common.delete", sq: "Fshi", en: "Delete", sr: "Obriši" },
  { key: "common.edit", sq: "Edito", en: "Edit", sr: "Uredi" },
  { key: "patient.firstName", sq: "Emri", en: "First name", sr: "Ime" },
  { key: "patient.lastName", sq: "Mbiemri", en: "Last name", sr: "Prezime" },
  { key: "visit.diagnosis", sq: "Diagnoza", en: "Diagnosis", sr: "Dijagnoza" },
  { key: "visit.treatment", sq: "Trajtimi", en: "Treatment", sr: "Lečenje" },
  { key: "lab.result", sq: "Rezultati", en: "Result", sr: "Rezultat" },
  { key: "billing.invoice", sq: "Faturë", en: "Invoice", sr: "Račun" },
];

const LANGUAGES = [
  { code: "sq", label: "Shqip", flag: "🇦🇱", complete: 100 },
  { code: "en", label: "English", flag: "🇬🇧", complete: 95 },
  { code: "sr", label: "Srpski", flag: "🇷🇸", complete: 67 },
  { code: "de", label: "Deutsch", flag: "🇩🇪", complete: 0 },
  { code: "it", label: "Italiano", flag: "🇮🇹", complete: 0 },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", complete: 0 },
];

export default function TranslationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Përkthimet"
        description="Menaxho përkthimet e fjalëve dhe frazave të aplikacionit në gjuhë të ndryshme"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Languages className="h-4 w-4 text-primary" /> Gjuhët e mbështetura
          </CardTitle>
          <CardDescription>Përparimi i përkthimeve për secilën gjuhë</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LANGUAGES.map((l) => (
            <div key={l.code} className="rounded-lg border border-border/40 bg-card/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{l.flag}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{l.label}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{l.code}</div>
                </div>
                {l.complete === 100 && <Badge variant="success">Plot</Badge>}
                {l.complete > 0 && l.complete < 100 && <Badge variant="warning">{l.complete}%</Badge>}
                {l.complete === 0 && <Badge variant="muted">I ri</Badge>}
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${l.complete}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Fjalori i përkthimeve</CardTitle>
            <CardDescription>{SAMPLES.length} entries — kërko sipas çelësit ose tekstit</CardDescription>
          </div>
          <Button variant="premium" size="sm">
            <Plus className="h-4 w-4" /> Shto term
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2">Çelësi</th>
                  <th className="px-4 py-2">🇦🇱 Shqip</th>
                  <th className="px-4 py-2">🇬🇧 English</th>
                  <th className="px-4 py-2">🇷🇸 Srpski</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLES.map((s) => (
                  <tr key={s.key} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{s.key}</td>
                    <td className="px-4 py-2">{s.sq}</td>
                    <td className="px-4 py-2">{s.en}</td>
                    <td className="px-4 py-2 text-muted-foreground">{s.sr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Importo / Eksporto përkthime</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">📥 Eksporto JSON</Button>
          <Button variant="outline" size="sm">📥 Eksporto CSV (Excel)</Button>
          <Button variant="outline" size="sm">📤 Importo nga skedar</Button>
          <Button variant="outline" size="sm">🔄 Sinkronizo me cloud</Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium"><Save className="h-4 w-4" /> Ruaj ndryshimet</Button>
      </div>
    </div>
  );
}
