import { Clock, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Orari i punës" };

const DAYS = [
  { code: "MON", name: "E hënë" },
  { code: "TUE", name: "E martë" },
  { code: "WED", name: "E mërkurë" },
  { code: "THU", name: "E enjte" },
  { code: "FRI", name: "E premte" },
  { code: "SAT", name: "E shtunë" },
  { code: "SUN", name: "E diel" },
];

export default function WorkHoursPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orari i punës"
        description="Caktoni ditët dhe orët kur klinika operon"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" /> Orari javor
          </CardTitle>
          <CardDescription>Termet do të mund të planifikohen vetëm brenda këtyre orëve.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DAYS.map((d, i) => {
              const isWeekend = i >= 5;
              return (
                <div key={d.code} className="grid grid-cols-1 md:grid-cols-[160px_auto_1fr_1fr] gap-3 items-center rounded-lg border border-border/40 bg-card/40 px-4 py-3">
                  <div className="font-medium">{d.name}</div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={!isWeekend}
                      className="h-4 w-4 rounded border-input text-primary"
                    />
                    <span className="text-muted-foreground">{isWeekend ? "Pushim" : "I hapur"}</span>
                  </label>
                  <Input type="time" defaultValue={isWeekend ? "" : "08:00"} />
                  <Input type="time" defaultValue={isWeekend ? "" : "20:00"} />
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Pushimi për drekë:</strong> opsionale — mund të shtosh interval ndarës 12:00–13:00 për çdo ditë nga konfigurimi i avancuar.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Pushime publike & festa</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            Mund të shtosh data specifike kur klinika është e mbyllur (festa, ditë lirie). Sistemi i parandalon të planifikojë takime në ato ditë.
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" size="default"><Save className="h-4 w-4" /> Ruaj orarin</Button>
      </div>
    </div>
  );
}
