import { Building2, Save, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Të dhënat e biznesit" };

export default function ClinicSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Të dhënat e biznesit"
        description="Konfiguro emrin, logon dhe informacionet kryesore të klinikës"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" /> Identiteti i klinikës
          </CardTitle>
          <CardDescription>Këto të dhëna do të shfaqen në fatura, fletë-lëshimet dhe raportet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/20 px-6 py-8 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="mt-2 text-sm font-medium">Klik për të ngarkuar logon</div>
            <div className="text-xs text-muted-foreground mt-0.5">PNG ose SVG, deri 2 MB</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 text-xs">Emri i klinikës</Label>
              <Input defaultValue="Klinika Demo SISH" placeholder="P.sh. Klinika Mjekësore X" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Numri i biznesit (NUI)</Label>
              <Input placeholder="810000000" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Email-i kryesor</Label>
              <Input type="email" placeholder="info@klinika.com" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Telefoni</Label>
              <Input placeholder="+383 ..." />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Qyteti</Label>
              <Input defaultValue="Prishtinë" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Kodi postar</Label>
              <Input placeholder="10000" />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1.5 text-xs">Adresa</Label>
              <Input placeholder="Rruga, numri i objektit" />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1.5 text-xs">Webfaqja</Label>
              <Input placeholder="https://klinika.com" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Multi-lokacion</CardTitle>
          <CardDescription>Aktivizo nëse keni më shumë se një degë</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-input text-primary" />
            <span>Aktivizo lokacionet e shumta</span>
          </label>
          <div className="mt-3 rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            Pas aktivizimit, do të mund të shtoni dega të reja dhe të lidhni stafin/pacientët me lokacione specifike.
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" size="default">
          <Save className="h-4 w-4" /> Ruaj ndryshimet
        </Button>
      </div>
    </div>
  );
}
