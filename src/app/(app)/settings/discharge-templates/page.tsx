import { FileText, Plus, Edit, Copy, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Shabllone fletëlëshimi" };

const TEMPLATES = [
  {
    name: "Standard mjekësor",
    description: "Shabllon i thjeshtë me diagnozë, trajtim dhe rekomandime",
    sections: 5,
    isDefault: true,
  },
  {
    name: "Shtrirje spitalore",
    description: "Për pacientë që dalin pas shtrirjes — me përshkrim ditë-pas-dite",
    sections: 8,
  },
  {
    name: "Pas operacioni",
    description: "Përmban detaje të operacionit, anestezisë dhe kujdesi post-op",
    sections: 7,
  },
  {
    name: "Kontroll dermatologjik",
    description: "Specifik për dermatologji me foto pre/post",
    sections: 4,
  },
  {
    name: "Pediatri",
    description: "Përshtatur për fëmijë me grafikun e rritjes",
    sections: 6,
  },
];

const VARIABLES = [
  "{{patient_name}}",
  "{{patient_id}}",
  "{{patient_age}}",
  "{{admitted_at}}",
  "{{discharged_at}}",
  "{{primary_diagnosis}}",
  "{{secondary_diagnoses}}",
  "{{doctor_name}}",
  "{{department}}",
  "{{follow_up_date}}",
  "{{prescriptions_list}}",
  "{{lab_results_summary}}",
];

export default function DischargeTemplatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shabllone fletëlëshimi"
        description="Shabllone të paracaktuara për dokumentet e lëshimit nga klinika"
        actions={
          <Button variant="premium" size="sm">
            <Plus className="h-4 w-4" /> Shabllon i ri
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" /> Shabllonet e disponueshme
          </CardTitle>
          <CardDescription>Mjekët mund të zgjedhin njërin gjatë krijimit të fletë-lëshimit</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border/40">
            {TEMPLATES.map((t) => (
              <li key={t.name} className="flex items-center justify-between px-5 py-4 hover:bg-accent/5">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{t.name}</h3>
                      {t.isDefault && <Badge variant="success">I parazgjedhur</Badge>}
                      <Badge variant="outline">{t.sections} seksione</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" aria-label="Shiko"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" aria-label="Edito"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" aria-label="Kopjo"><Copy className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Variabla të disponueshme</CardTitle>
          <CardDescription>Variablat zëvendësohen automatikisht me të dhënat e pacientit kur shablloni printohet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {VARIABLES.map((v) => (
              <code
                key={v}
                className="rounded-md border border-border/40 bg-card/60 px-2 py-1 text-xs font-mono hover:border-primary/30 cursor-pointer"
              >
                {v}
              </code>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editori i shabllonit (preview)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/40 bg-card/40 p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed">
            <strong>{`# {{clinic_name}} — FLETËLËSHIM`}</strong>
            {`\n\n`}
            <strong>Pacienti:</strong> {`{{patient_name}}, {{patient_age}} vjeç`}
            {`\n`}
            <strong>Pranuar më:</strong> {`{{admitted_at}}`}
            {`\n`}
            <strong>Lëshuar më:</strong> {`{{discharged_at}}`}
            {`\n\n`}
            <strong>## Diagnoza primare</strong>
            {`\n{{primary_diagnosis}}\n\n`}
            <strong>## Trajtimi</strong>
            {`\n{{treatment_summary}}\n\n`}
            <strong>## Rekomandime</strong>
            {`\nKontroll i ardhshëm: {{follow_up_date}}\n{{recommendations}}\n\n`}
            <em>Mjeku: {`{{doctor_name}}`}</em>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
