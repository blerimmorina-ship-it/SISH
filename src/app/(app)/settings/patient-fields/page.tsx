import { Calendar, Save, Plus, GripVertical, Eye, EyeOff, AsteriskSquare } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Pacient/Vizita" };

const PATIENT_FIELDS = [
  { key: "firstName", label: "Emri", visible: true, required: true, system: true },
  { key: "lastName", label: "Mbiemri", visible: true, required: true, system: true },
  { key: "parentName", label: "Emri i prindit", visible: true, required: false, system: true },
  { key: "personalId", label: "ID Personale", visible: true, required: false, system: true },
  { key: "dateOfBirth", label: "Datëlindja", visible: true, required: false, system: true },
  { key: "gender", label: "Gjinia", visible: true, required: false, system: true },
  { key: "bloodType", label: "Grupi i gjakut", visible: true, required: false, system: true },
  { key: "phone", label: "Telefoni", visible: true, required: true, system: true },
  { key: "email", label: "Emaili", visible: true, required: false, system: true },
  { key: "address", label: "Adresa", visible: true, required: false, system: true },
  { key: "city", label: "Qyteti", visible: true, required: false, system: true },
  { key: "occupation", label: "Profesioni", visible: false, required: false, system: true },
  { key: "emergencyContact", label: "Kontakt urgjence", visible: true, required: false, system: true },
  { key: "insurance", label: "Sigurimi shëndetësor", visible: true, required: false, system: true },
  { key: "allergies", label: "Alergjitë", visible: true, required: false, system: true },
  { key: "chronicDiseases", label: "Sëmundjet kronike", visible: true, required: false, system: true },
];

const VISIT_FIELDS = [
  { key: "reason", label: "Arsyeja", visible: true, required: false, system: true },
  { key: "symptoms", label: "Simptomat", visible: true, required: false, system: true },
  { key: "examination", label: "Ekzaminimi", visible: true, required: false, system: true },
  { key: "diagnosis", label: "Diagnoza", visible: true, required: false, system: true },
  { key: "treatment", label: "Trajtimi", visible: true, required: false, system: true },
  { key: "vitals", label: "Vital signs (BP, HR, Temp)", visible: false, required: false, system: false },
  { key: "weightHeight", label: "Pesha & gjatësia", visible: false, required: false, system: false },
];

function FieldsTable({ title, fields }: { title: string; fields: typeof PATIENT_FIELDS }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Drag & drop për renditjen · klik për të ndryshuar dukshmërinë</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 w-8"></th>
              <th className="px-3 py-2">Fusha</th>
              <th className="px-3 py-2">Çelësi</th>
              <th className="px-3 py-2 text-center w-24">Dukshëm</th>
              <th className="px-3 py-2 text-center w-24">E kërkuar</th>
              <th className="px-3 py-2 text-center w-24">Tipi</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.key} className="border-b border-border/30 last:border-b-0 hover:bg-accent/5">
                <td className="px-3 py-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                </td>
                <td className="px-3 py-2 font-medium">{f.label}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{f.key}</td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    className={`inline-flex h-7 w-7 items-center justify-center rounded ${
                      f.visible
                        ? "bg-success/15 text-success hover:bg-success/25"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    className={`inline-flex h-7 w-7 items-center justify-center rounded ${
                      f.required
                        ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <AsteriskSquare className="h-3.5 w-3.5" />
                  </button>
                </td>
                <td className="px-3 py-2 text-center">
                  {f.system ? <Badge variant="secondary">Sistemi</Badge> : <Badge variant="info">Custom</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default function PatientFieldsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacienti / Vizita"
        description="Cilat fusha shfaqen, janë të kërkuara, ose të fshehura në formularët e pacientit dhe vizitës"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" /> Auto-numërimi
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Pacient</div>
            <div className="font-mono text-sm">P-{"{year}"}-{"{seq}"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Vizitë</div>
            <div className="font-mono text-sm">V-{"{year}"}-{"{seq}"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Urdhër lab</div>
            <div className="font-mono text-sm">L-{"{year}"}-{"{seq}"}</div>
          </div>
        </CardContent>
      </Card>

      <FieldsTable title="Fushat e pacientit" fields={PATIENT_FIELDS} />
      <FieldsTable title="Fushat e vizitës" fields={VISIT_FIELDS} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-primary" /> Shto fushë custom
          </CardTitle>
          <CardDescription>Krijo fusha të personalizuara për nevojat specifike të klinikës</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Mund të shtosh fusha të llojit text, numër, datë, lista zgjedhjesh ose checkbox. Ato shfaqen automatikisht në formularët e pacientit/vizitës dhe ruhen në bazë.
          </div>
          <Button variant="premium" size="sm" className="mt-3">
            <Plus className="h-4 w-4" /> Fushë custom
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" size="default"><Save className="h-4 w-4" /> Ruaj cilësimet</Button>
      </div>
    </div>
  );
}
