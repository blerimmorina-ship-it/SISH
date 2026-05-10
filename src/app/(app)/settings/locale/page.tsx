import { Languages, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Lokalizimi" };

export default function LocalePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Lokalizimi" description="Gjuha, formati i datës dhe orës" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Languages className="h-4 w-4 text-primary" /> Cilësimet e gjuhës
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Gjuha kryesore</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
              <option value="sq">Shqip</option>
              <option value="en">English</option>
              <option value="sr">Srpski</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Formati i datës</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
              <option>dd/MM/yyyy (02/05/2026)</option>
              <option>MM/dd/yyyy (05/02/2026)</option>
              <option>yyyy-MM-dd (2026-05-02)</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Formati i orës</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
              <option>24h (14:30)</option>
              <option>12h (2:30 PM)</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Zona kohore</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
              <option>Europe/Tirane (UTC+1)</option>
              <option>Europe/Belgrade (UTC+1)</option>
              <option>UTC</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Dita e parë e javës</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
              <option>E hënë</option>
              <option>E diel</option>
            </select>
          </div>
          <label className="md:col-span-2 flex items-center gap-2 text-sm mt-2">
            <input type="checkbox" className="h-4 w-4 rounded border-input text-primary" />
            <span>Lejo përdoruesit individualë të zgjedhin gjuhën e tyre</span>
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" size="default"><Save className="h-4 w-4" /> Ruaj</Button>
      </div>
    </div>
  );
}
