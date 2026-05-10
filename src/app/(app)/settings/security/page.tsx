import { ShieldCheck, Save, Lock, Key, AlertOctagon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS } from "@/lib/rbac";

export const metadata = { title: "Siguria & Rolet" };

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Siguria & Rolet" description="Politikat e fjalëkalimit, sesionet dhe lejet" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-primary" /> Politika e fjalëkalimit
          </CardTitle>
          <CardDescription>Kërkesat minimale për të gjithë përdoruesit</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Gjatësia minimale</Label>
            <Input type="number" defaultValue={8} min={6} max={32} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Vlefshmëria (ditë, 0 = pa skadim)</Label>
            <Input type="number" defaultValue={90} min={0} />
          </div>
          {[
            "Kërko të paktën një shkronjë të madhe",
            "Kërko të paktën një shkronjë të vogël",
            "Kërko të paktën një numër",
            "Kërko të paktën një karakter special",
            "Mos lejo rritje fjalëkalimi (rritje sekuenciale)",
          ].map((r, i) => (
            <label key={i} className="md:col-span-2 flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked={i < 4} className="h-4 w-4 rounded border-input text-primary" />
              <span>{r}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4 text-primary" /> Sesionet & 2FA
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Kohëzgjatja e sesionit (orë)</Label>
            <Input type="number" defaultValue={8} min={1} max={168} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Idle timeout (minuta)</Label>
            <Input type="number" defaultValue={30} min={5} />
          </div>
          <label className="md:col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input text-primary" />
            <span>Detyro 2FA për Super Admin & Admin</span>
          </label>
          <label className="md:col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded border-input text-primary" />
            <span>Detyro 2FA për të gjithë përdoruesit</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertOctagon className="h-4 w-4 text-warning" /> Bllokimi i llogarisë
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Përpjekje të dështuara para bllokimit</Label>
            <Input type="number" defaultValue={5} min={3} max={20} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Kohëzgjatja e bllokimit (minuta)</Label>
            <Input type="number" defaultValue={15} min={5} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" /> Rolet e disponueshme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <div key={role} className="rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-sm">
                <div className="font-medium">{label}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{role}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" size="default"><Save className="h-4 w-4" /> Ruaj politikat</Button>
      </div>
    </div>
  );
}
