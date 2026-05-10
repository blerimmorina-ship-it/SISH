import { Menu, Save, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type Role } from "@/lib/rbac";

export const metadata = { title: "Menutë e aplikacionit" };

const MODULES = [
  { id: "dashboard", label: "Paneli", group: "Përmbledhje" },
  { id: "activity", label: "Aktiviteti", group: "Përmbledhje" },
  { id: "patients", label: "Pacientët", group: "Klinika" },
  { id: "visits", label: "Vizitat", group: "Klinika" },
  { id: "appointments", label: "Terminet", group: "Klinika" },
  { id: "operations", label: "Operacionet", group: "Klinika" },
  { id: "prescriptions", label: "Recetat", group: "Klinika" },
  { id: "clinical-templates", label: "Shabllonet klinike", group: "Klinika" },
  { id: "discharge", label: "Fletëlëshimet", group: "Klinika" },
  { id: "lab-orders", label: "Urdhrat lab", group: "Laboratori" },
  { id: "lab-results", label: "Rezultatet", group: "Laboratori" },
  { id: "lab-templates", label: "Shabllonet lab", group: "Laboratori" },
  { id: "billing", label: "Faturimi", group: "Financa" },
  { id: "cashbox", label: "Arka", group: "Financa" },
  { id: "inventory", label: "Stoku", group: "Financa" },
  { id: "quotes", label: "Ofertat", group: "Financa" },
  { id: "offers", label: "Çmimorja", group: "Financa" },
  { id: "reports", label: "Raportet", group: "Analiza" },
  { id: "users", label: "Përdoruesit", group: "Administrimi" },
  { id: "workflows", label: "Workflows", group: "Administrimi" },
];

const ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "DOCTOR", "LAB_TECHNICIAN", "RECEPTIONIST", "ACCOUNTANT", "NURSE", "VIEWER"];

const DEFAULT_MATRIX: Record<string, Role[]> = {
  dashboard: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "LAB_TECHNICIAN", "RECEPTIONIST", "ACCOUNTANT", "NURSE", "VIEWER"],
  patients: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "LAB_TECHNICIAN"],
  "lab-orders": ["SUPER_ADMIN", "ADMIN", "DOCTOR", "LAB_TECHNICIAN"],
  billing: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "RECEPTIONIST"],
  cashbox: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"],
  users: ["SUPER_ADMIN", "ADMIN"],
  workflows: ["SUPER_ADMIN", "ADMIN"],
  reports: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "ACCOUNTANT"],
};

function isVisible(moduleId: string, role: Role): boolean {
  const allowed = DEFAULT_MATRIX[moduleId] ?? ROLES;
  return allowed.includes(role);
}

export default function MenusSettingsPage() {
  const grouped = MODULES.reduce<Record<string, typeof MODULES>>((acc, m) => {
    (acc[m.group] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="Menutë e aplikacionit" description="Caktoni se cilat module shfaqen për secilin rol" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Menu className="h-4 w-4 text-primary" /> Matrica e dukshmërisë
          </CardTitle>
          <CardDescription>
            ✓ = roli e sheh modulin · — = i fshehur. Mund të mbivendosësh defaults-et për secilin përdorues nga profili i tij.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left sticky left-0 bg-muted/30">Moduli</th>
                  {ROLES.map((r) => (
                    <th key={r} className="px-2 py-3 text-center min-w-[80px]">{ROLE_LABELS[r]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([group, items]) => (
                  <>
                    <tr key={`g-${group}`} className="bg-muted/20">
                      <td colSpan={ROLES.length + 1} className="px-4 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                        {group}
                      </td>
                    </tr>
                    {items.map((m) => (
                      <tr key={m.id} className="border-b border-border/30 last:border-b-0 hover:bg-accent/5">
                        <td className="px-4 py-2 font-medium sticky left-0 bg-card">{m.label}</td>
                        {ROLES.map((r) => {
                          const v = isVisible(m.id, r);
                          return (
                            <td key={r} className="px-2 py-2 text-center">
                              <button
                                type="button"
                                className={`inline-flex h-6 w-6 items-center justify-center rounded ${
                                  v
                                    ? "bg-success/15 text-success hover:bg-success/25"
                                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                                }`}
                                aria-label={v ? "Dukshëm" : "I fshehur"}
                              >
                                {v ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Renditja e menyve</CardTitle>
          <CardDescription>Drag & drop për të ndryshuar renditjen (ruhet automatikisht)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            💡 Mund të zhvendosësh modulet brenda secilit grup. Ndryshimet aplikohen për të gjithë përdoruesit (në varësi të rolit).
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.keys(grouped).map((g) => (
              <Badge key={g} variant="outline">{g}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" size="default"><Save className="h-4 w-4" /> Ruaj matricën</Button>
      </div>
    </div>
  );
}
