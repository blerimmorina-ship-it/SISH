import { Bell, Mail, MessageSquare, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Njoftimet (SMS/Email)" };

const TRIGGERS = [
  { key: "appointment-reminder-24h", label: "Kujtues 24 orë para terminit", channels: ["SMS", "Email"] },
  { key: "appointment-confirmed", label: "Konfirmim termini", channels: ["SMS"] },
  { key: "lab-results-ready", label: "Rezultatet e analizave gati", channels: ["Email", "SMS"] },
  { key: "invoice-issued", label: "Faturë e re e lëshuar", channels: ["Email"] },
  { key: "payment-received", label: "Konfirmim pagese", channels: ["Email"] },
  { key: "low-stock-alert", label: "Alarm stoku i ulët (staf)", channels: ["Email"] },
  { key: "critical-result", label: "Rezultat kritik laboratorik (staf)", channels: ["SMS", "Email"] },
];

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Njoftimet" description="Konfiguro kanalet dhe ngjarjet që dërgojnë njoftime" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-primary" /> Konfigurimi Email (SMTP)
            </CardTitle>
            <CardDescription>Përdor llogarinë tënde SMTP ose providentin e jashtëm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="mb-1.5 text-xs">Hosti SMTP</Label>
              <Input placeholder="smtp.gmail.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 text-xs">Porti</Label>
                <Input type="number" defaultValue={587} />
              </div>
              <div>
                <Label className="mb-1.5 text-xs">Encryption</Label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
                  <option>TLS</option>
                  <option>SSL</option>
                  <option>Asnjë</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Përdoruesi</Label>
              <Input placeholder="user@example.com" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Fjalëkalimi</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Email "Nga"</Label>
              <Input placeholder="info@klinika.com" />
            </div>
            <Button variant="outline" size="sm" className="w-full">Test dërgimi</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-primary" /> Konfigurimi SMS
            </CardTitle>
            <CardDescription>Mund të lidhësh me Twilio, Vonage ose provider lokal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="mb-1.5 text-xs">Provider</Label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
                <option>Twilio</option>
                <option>Vonage</option>
                <option>MessageBird</option>
                <option>Local SMS Gateway</option>
              </select>
            </div>
            <div>
              <Label className="mb-1.5 text-xs">API Key</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Numri "Nga"</Label>
              <Input placeholder="+383 ..." />
            </div>
            <div className="rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              💡 Kosto e parashikuar: ≈0.05€ për SMS. Sistemi limit-on automatikisht 1000 SMS/ditë në fillim.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" /> Triggers automatikë
          </CardTitle>
          <CardDescription>Cilat ngjarje duhet të dërgojnë njoftime dhe në cilin kanal</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-2 py-2 text-left">Ngjarja</th>
                <th className="px-2 py-2 text-center">SMS</th>
                <th className="px-2 py-2 text-center">Email</th>
                <th className="px-2 py-2 text-center">Push</th>
              </tr>
            </thead>
            <tbody>
              {TRIGGERS.map((t) => (
                <tr key={t.key} className="border-b border-border/30 last:border-b-0">
                  <td className="px-2 py-2">{t.label}</td>
                  {["SMS", "Email", "Push"].map((ch) => (
                    <td key={ch} className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        defaultChecked={t.channels.includes(ch)}
                        className="h-4 w-4 rounded border-input text-primary"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" size="default"><Save className="h-4 w-4" /> Ruaj konfigurimin</Button>
      </div>
    </div>
  );
}
