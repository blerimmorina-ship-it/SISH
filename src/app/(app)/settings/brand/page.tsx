import { Palette, Save, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Brendi & pamja" };

const PRESET_THEMES = [
  { name: "Indigo / Emerald", primary: "#6366F1", accent: "#10B981", current: true },
  { name: "Royal Blue", primary: "#3B82F6", accent: "#8B5CF6" },
  { name: "Premium Black", primary: "#0F172A", accent: "#F59E0B" },
  { name: "Coral / Sky", primary: "#F43F5E", accent: "#0EA5E9" },
  { name: "Forest", primary: "#059669", accent: "#84CC16" },
  { name: "Custom", primary: "#?", accent: "#?" },
];

export default function BrandPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Brendi & pamja" description="Logoja, ngjyrat dhe identiteti vizual i klinikës" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4 text-primary" /> Logoja
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 text-xs">Logo për tema të ndritshme</Label>
            <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="mt-2 text-xs text-muted-foreground">PNG/SVG, max 2MB</div>
            </div>
          </div>
          <div>
            <Label className="mb-2 text-xs">Logo për tema të errët</Label>
            <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="mt-2 text-xs text-muted-foreground">PNG/SVG, max 2MB</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4 text-primary" /> Paleta e ngjyrave
          </CardTitle>
          <CardDescription>Tema kryesore aplikohet te butonët, accent-i dhe grafikët</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PRESET_THEMES.map((t) => (
              <button
                key={t.name}
                type="button"
                className={`rounded-xl border p-4 text-left transition-all ${
                  t.current ? "border-primary ring-2 ring-primary/30" : "border-border/40 hover:border-primary/30"
                }`}
              >
                <div className="flex gap-2 mb-3">
                  <div className="h-10 w-10 rounded-lg" style={{ background: t.primary }} />
                  <div className="h-10 w-10 rounded-lg" style={{ background: t.accent }} />
                </div>
                <div className="text-sm font-medium">{t.name}</div>
                {t.current && <div className="text-xs text-primary mt-0.5">✓ Aktive</div>}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Slogan & meta</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Slogan</Label>
            <Input placeholder="P.sh. Kujdesi shëndetësor i së ardhmes" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Font për tituj</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
              <option>Geist Sans</option>
              <option>Inter</option>
              <option>Roboto</option>
              <option>Plus Jakarta Sans</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Font për tekst</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
              <option>Geist Sans</option>
              <option>Inter</option>
              <option>System UI</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" size="default"><Save className="h-4 w-4" /> Ruaj brendi</Button>
      </div>
    </div>
  );
}
