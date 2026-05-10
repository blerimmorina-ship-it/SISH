import { FileBarChart, Save, Upload, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Konfigurimi i raporteve" };

const TEMPLATES = [
  { name: "Faturë", code: "INVOICE", paper: "A4", description: "Layouti i faturës së pacientit" },
  { name: "Raport laboratorik", code: "LAB_RESULT", paper: "A4", description: "Forma e rezultateve të analizave" },
  { name: "Fletëlëshim", code: "DISCHARGE", paper: "A4", description: "Dokumenti i lëshimit nga klinika" },
  { name: "Ofertë", code: "QUOTE", paper: "A4", description: "Oferta për pacient ose prospekt" },
  { name: "Recetë mjekësore", code: "PRESCRIPTION", paper: "A5", description: "Receta për barna" },
  { name: "Raporti X (Cash)", code: "X_REPORT", paper: "Termal 80mm", description: "Përmbledhje arkë gjatë ditës" },
  { name: "Raporti Z (Mbyllje)", code: "Z_REPORT", paper: "Termal 80mm", description: "Mbyllje e arkës ditore" },
];

export default function ReportsConfigPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Konfigurimi i raporteve" description="Pamja e dokumenteve të printuara — header, footer, ngjyra, layout" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4 text-primary" /> Header global
          </CardTitle>
          <CardDescription>Aplikohet te të gjithë dokumentet (mund ta mbivendosësh për shabllon specifik)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 text-xs">Logo për print</Label>
            <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="mt-2 text-xs text-muted-foreground">PNG (preferohet) max 1MB</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 text-xs">Tekst nën logo</Label>
              <Input placeholder="P.sh. Klinika Demo SISH · Prishtinë" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Slogan / nënshkrim</Label>
              <Input placeholder="Kujdesi shëndetësor i së ardhmes" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Numri tatimor në header</Label>
              <Input placeholder="NUI: 810000000" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Footer global</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="mb-1.5 text-xs">Tekst footer-i</Label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm"
              placeholder="P.sh. Faleminderit për besimin tuaj! · www.klinika.com"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input text-primary" />
              <span>Shfaq numër faqe</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input text-primary" />
              <span>Shfaq vulë & nënshkrim</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-input text-primary" />
              <span>QR-code për verifikim</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileBarChart className="h-4 w-4 text-primary" /> Shabllonet e dokumenteve
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Dokumenti</th>
                <th className="px-4 py-3">Kodi</th>
                <th className="px-4 py-3">Letra</th>
                <th className="px-4 py-3">Përshkrimi</th>
                <th className="px-4 py-3 text-right">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {TEMPLATES.map((t) => (
                <tr key={t.code} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{t.code}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{t.paper}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{t.description}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /> Edito</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Margjinat & orientimi</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Lart (mm)</Label>
            <Input type="number" defaultValue={18} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Posht (mm)</Label>
            <Input type="number" defaultValue={18} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Majtas (mm)</Label>
            <Input type="number" defaultValue={20} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Djathtas (mm)</Label>
            <Input type="number" defaultValue={20} />
          </div>
          <div className="col-span-2">
            <Label className="mb-1.5 text-xs">Orientimi i parazgjedhur</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
              <option>Vertikal (portret)</option>
              <option>Horizontal (peizazh)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" size="default"><Save className="h-4 w-4" /> Ruaj cilësimet e printimit</Button>
      </div>
    </div>
  );
}
