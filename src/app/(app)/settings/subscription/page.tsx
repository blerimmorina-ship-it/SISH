import { Wand2, CheckCircle2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Abonimet" };

const PLANS = [
  {
    name: "Starter",
    price: "29 €",
    period: "/muaj",
    features: ["Deri 500 pacientë", "1 lokacion", "5 përdorues", "Backup ditor", "Mbështetje email"],
    current: false,
  },
  {
    name: "Professional",
    price: "79 €",
    period: "/muaj",
    features: ["Deri 5,000 pacientë", "3 lokacione", "20 përdorues", "Backup orë", "Mbështetje 24/7", "Raporte të avancuara", "API access"],
    current: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Special",
    period: "kontakto",
    features: ["Pa kufi pacientësh", "Pa kufi lokacionesh", "Pa kufi përdoruesish", "Backup real-time", "SLA 99.99%", "On-premise opsion", "Mjeku i dedikuar", "Trajnim staf"],
    current: false,
  },
];

export default function SubscriptionPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Abonimet" description="Plani aktual dhe opsionet e disponueshme" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wand2 className="h-4 w-4 text-primary" /> Plani aktual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="default"><Sparkles className="h-3 w-3" /> Aktiv</Badge>
                <h3 className="text-2xl font-bold mt-2">SISH Cloud Pro</h3>
                <p className="text-sm text-muted-foreground mt-1">Riformulim më 15 Maj 2026 · 79.00€</p>
              </div>
              <Button variant="outline" size="sm">Menaxho</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((p) => (
          <Card key={p.name} className={p.current ? "ring-2 ring-primary" : ""}>
            <CardContent className="p-6 flex flex-col h-full">
              {p.popular && <Badge variant="default" className="self-start mb-3">Më popullorë</Badge>}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gradient">{p.price}</span>
                <span className="text-sm text-muted-foreground ml-1">{p.period}</span>
              </div>
              <ul className="mt-4 space-y-2 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {p.current ? (
                <Button variant="outline" className="mt-4 w-full" disabled>Plani aktual</Button>
              ) : (
                <Button variant={p.popular ? "premium" : "outline"} className="mt-4 w-full">
                  Zgjidh planin
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
