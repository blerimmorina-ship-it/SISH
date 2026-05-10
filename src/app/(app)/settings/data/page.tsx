import { Database, FileDown, FileUp, HardDrive, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Importet & Eksportet" };

export default function DataPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Importet & Eksportet" description="Migrim dhe backup-i i të dhënave të klinikës" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileDown className="h-4 w-4 text-primary" /> Eksport
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileDown className="h-4 w-4" /> Eksporto pacientët (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileDown className="h-4 w-4" /> Eksporto vizitat e plota (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileDown className="h-4 w-4" /> Eksporto faturat (Excel)
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileDown className="h-4 w-4" /> Eksporto rezultatet laboratorike (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileDown className="h-4 w-4" /> Backup i plotë (SQL/JSON)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileUp className="h-4 w-4 text-primary" /> Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileUp className="h-4 w-4" /> Importo pacientët (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileUp className="h-4 w-4" /> Importo katalogun e shërbimeve
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileUp className="h-4 w-4" /> Importo produkte/inventar
            </Button>
            <div className="rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground mt-3">
              💡 Përdor shabllone CSV nga "Eksporto" për struktura të sakta. Importi validon çdo rresht para ruajtjes.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HardDrive className="h-4 w-4 text-primary" /> Backup automatik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input text-primary" />
            <span>Backup ditor automatik në 03:00</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input text-primary" />
            <span>Backup javor në cloud (i enkriptuar)</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded border-input text-primary" />
            <span>Mbaj historikun për 7 vjet (kërkesë GDPR/HIPAA)</span>
          </label>
          <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-xs">
            <ShieldCheck className="inline h-4 w-4 text-success mr-1" />
            <span className="text-success font-medium">Backup-i i fundit:</span> Sot · 03:00 · 24.5 MB · ✓ Suksesshëm
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
