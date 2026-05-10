import { Wallet, Save, CreditCard, Banknote, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Pagesa & TVSH" };

export default function PaymentSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Pagesa & TVSH" description="Konfiguro metodat e pagesës, valutën dhe taksat" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-primary" /> Valuta & lokalizimi
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Valuta</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40">
              <option value="EUR">EUR — Euro (€)</option>
              <option value="ALL">ALL — Lek (L)</option>
              <option value="USD">USD — Dollar ($)</option>
              <option value="CHF">CHF — Frang Zviceran</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Format i çmimit</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40">
              <option>1.234,56 €</option>
              <option>1,234.56 €</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Pikat e dhjetorit</Label>
            <Input type="number" defaultValue={2} min={0} max={4} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metodat e pagesës</CardTitle>
          <CardDescription>Aktivizo metodat që pranon klinika</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { icon: Banknote, label: "Kesh", description: "Pagesa në para të gatshme", default: true },
            { icon: CreditCard, label: "Kartë (POS)", description: "Visa, MasterCard, Maestro", default: true },
            { icon: Building2, label: "Transfertë bankare", description: "Pagesa nga llogaritë bankare", default: true },
            { icon: Wallet, label: "Sigurim shëndetësor", description: "Direkt me kompani sigurimi", default: false },
            { icon: Wallet, label: "Pagesa me këste", description: "Plan me këste për terapi të zgjatura", default: false },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <label key={m.label} className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 px-4 py-3 cursor-pointer">
                <input type="checkbox" defaultChecked={m.default} className="h-4 w-4 rounded border-input text-primary" />
                <Icon className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.description}</div>
                </div>
                {m.default && <Badge variant="success">Aktive</Badge>}
              </label>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">TVSH-ja</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">TVSH e parazgjedhur (%)</Label>
            <Input type="number" defaultValue={0} min={0} max={50} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Numri tatimor</Label>
            <Input placeholder="P.sh. 123456789" />
          </div>
          <label className="md:col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded border-input text-primary" />
            <span>Çmimet janë me TVSH të përfshirë</span>
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" size="default"><Save className="h-4 w-4" /> Ruaj cilësimet</Button>
      </div>
    </div>
  );
}
