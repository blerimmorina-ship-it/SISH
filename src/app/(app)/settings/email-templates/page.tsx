import { Plus, Mail, MessageSquare, Edit } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Shabllonet email/SMS" };

const TEMPLATES = [
  { name: "Mirëseardhje pacient i ri", channel: "Email", lang: "Shqip" },
  { name: "Konfirmim termini", channel: "SMS", lang: "Shqip" },
  { name: "Kujtues termini 24h", channel: "SMS", lang: "Shqip" },
  { name: "Rezultatet janë gati", channel: "Email", lang: "Shqip" },
  { name: "Faturë e re", channel: "Email", lang: "Shqip" },
  { name: "Konfirmim pagese", channel: "Email", lang: "Shqip" },
  { name: "Reset fjalëkalimi", channel: "Email", lang: "Multi" },
  { name: "Ftesa për staf", channel: "Email", lang: "Multi" },
];

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shabllonet Email/SMS"
        description="Personalizo mesazhet automatike me variabla dhe brending"
        actions={<Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Shabllon i ri</Button>}
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Emri</th>
                  <th className="px-4 py-3">Kanali</th>
                  <th className="px-4 py-3">Gjuha</th>
                  <th className="px-4 py-3">Statusi</th>
                  <th className="px-4 py-3 text-right">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {TEMPLATES.map((t) => (
                  <tr key={t.name} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {t.channel === "Email" ? <Mail className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                        {t.channel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.lang}</td>
                    <td className="px-4 py-3"><Badge variant="success">Aktiv</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        💡 <strong className="text-foreground">Variabla të disponueshme:</strong>{" "}
        <code className="rounded bg-card px-1.5 py-0.5 mr-1">{"{patient_name}"}</code>
        <code className="rounded bg-card px-1.5 py-0.5 mr-1">{"{appointment_date}"}</code>
        <code className="rounded bg-card px-1.5 py-0.5 mr-1">{"{doctor_name}"}</code>
        <code className="rounded bg-card px-1.5 py-0.5 mr-1">{"{clinic_name}"}</code>
        <code className="rounded bg-card px-1.5 py-0.5 mr-1">{"{invoice_total}"}</code>
        <code className="rounded bg-card px-1.5 py-0.5">{"{link}"}</code>
      </div>
    </div>
  );
}
