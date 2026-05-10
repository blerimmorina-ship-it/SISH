import { Sliders, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Të tjera" };

const TOGGLES = [
  { label: "Aktivizo dark mode automatik (sipas sistemit)", default: true },
  { label: "Trego notifikime push në desktop", default: true },
  { label: "Trego tutorial dhe këshilla në UI", default: false },
  { label: "Aktivizo telemetri anonime për përmirësime", default: true },
  { label: "Lejo eksperimente UI (beta features)", default: false },
  { label: "Detyro konfirmim para fshirjes së pacientit", default: true },
  { label: "Trego avatar me iniciale për pacientë pa foto", default: true },
  { label: "Auto-save në formularë", default: true },
  { label: "Compact mode (paraqitje më e dendur)", default: false },
];

export default function OtherSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Konfigurimet e tjera" description="Pamja, sjellja dhe preferencat e ndryshme të sistemit" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sliders className="h-4 w-4 text-primary" /> Cilësimet e UI/UX
          </CardTitle>
          <CardDescription>Personalizo sjelljen e ndërfaqes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {TOGGLES.map((t, i) => (
            <label key={i} className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 px-4 py-3 cursor-pointer">
              <input type="checkbox" defaultChecked={t.default} className="h-4 w-4 rounded border-input text-primary" />
              <span className="text-sm">{t.label}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" size="default"><Save className="h-4 w-4" /> Ruaj</Button>
      </div>
    </div>
  );
}
