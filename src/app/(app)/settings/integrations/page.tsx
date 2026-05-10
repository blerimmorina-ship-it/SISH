import { Plug, Calendar, Cloud, FileText, Activity, CreditCard, Smartphone, Mail } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Integrimet" };

const INTEGRATIONS = [
  { icon: Calendar, name: "Google Calendar", description: "Sinkronizim i terminëve dy-drejtimësh", connected: false, category: "Kalendar" },
  { icon: Calendar, name: "Outlook Calendar", description: "Termet automatikisht në Outlook", connected: false, category: "Kalendar" },
  { icon: Cloud, name: "Google Drive", description: "Backup automatik i dokumenteve", connected: true, category: "Storage" },
  { icon: Cloud, name: "Dropbox", description: "Backup në Dropbox", connected: false, category: "Storage" },
  { icon: FileText, name: "HL7 / FHIR", description: "Standardi për shkëmbim mjekësor", connected: false, category: "Mjekësore" },
  { icon: Activity, name: "Lab Analyzer (Mindray)", description: "Marrje automatike e rezultateve", connected: false, category: "Mjekësore" },
  { icon: Activity, name: "X-Ray PACS", description: "Imazhe radiologjike DICOM", connected: false, category: "Mjekësore" },
  { icon: CreditCard, name: "Stripe", description: "Pagesa online për pacientë", connected: false, category: "Pagesa" },
  { icon: CreditCard, name: "Raiffeisen Pay", description: "POS dhe e-banking", connected: false, category: "Pagesa" },
  { icon: Smartphone, name: "Twilio SMS", description: "Njoftime SMS", connected: false, category: "Komunikim" },
  { icon: Mail, name: "SendGrid", description: "Email marketing", connected: false, category: "Komunikim" },
  { icon: Plug, name: "Webhook URL", description: "Lidhje me sistemet e tua", connected: false, category: "API" },
];

export default function IntegrationsPage() {
  const grouped = INTEGRATIONS.reduce<Record<string, typeof INTEGRATIONS>>((acc, i) => {
    (acc[i.category] ??= []).push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="Integrimet" description="Lidh SISH me shërbime të jashtme" />

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <Card key={it.name} className="card-hover">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 p-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{it.name}</h3>
                        {it.connected && <Badge variant="success">Lidhur</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{it.description}</p>
                    </div>
                    <Button variant={it.connected ? "outline" : "premium"} size="sm">
                      {it.connected ? "Konfiguro" : "Lidh"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
