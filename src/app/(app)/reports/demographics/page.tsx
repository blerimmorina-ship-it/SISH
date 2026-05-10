import { Users, FileDown, Heart, MapPin } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "Demografia" };
export const dynamic = "force-dynamic";

export default async function DemographicsReportPage() {
  const db = await getDb();
  const [total, byGender, byBlood, byCity] = await Promise.all([
    db.patient.count({ where: { isActive: true } }),
    db.patient.groupBy({ by: ["gender"], _count: { _all: true } }),
    db.patient.groupBy({ by: ["bloodType"], _count: { _all: true } }),
    db.patient.groupBy({
      by: ["city"],
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
      where: { city: { not: null } },
    }),
  ]);

  const genderLabels: Record<string, string> = {
    MALE: "Mashkull",
    FEMALE: "Femër",
    OTHER: "Tjetër",
    UNSPECIFIED: "Pa specifikuar",
  };
  const bloodLabels: Record<string, string> = {
    A_POS: "A+", A_NEG: "A−", B_POS: "B+", B_NEG: "B−",
    AB_POS: "AB+", AB_NEG: "AB−", O_POS: "O+", O_NEG: "O−",
    UNKNOWN: "I panjohur",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demografia e Pacientëve"
        description="Analizë e popullsisë së pacientëve sipas gjinisë, gjakut dhe vendbanimit"
        breadcrumb={[
          { label: "Analiza" },
          { label: "Raportet", href: "/reports" },
          { label: "Demografia" },
        ]}
        actions={<Button variant="outline" size="sm"><FileDown className="h-4 w-4" /> Eksporto</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pacientë gjithsej" value={total} icon={Users} tone="primary" />
        <StatCard label="Meshkuj" value={byGender.find((g) => g.gender === "MALE")?._count._all ?? 0} icon={Users} tone="info" />
        <StatCard label="Femra" value={byGender.find((g) => g.gender === "FEMALE")?._count._all ?? 0} icon={Heart} tone="accent" />
        <StatCard label="Qytete" value={byCity.length} icon={MapPin} tone="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Sipas gjinisë</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {byGender.map((g) => {
              const pct = total > 0 ? (g._count._all / total) * 100 : 0;
              return (
                <div key={g.gender}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{genderLabels[g.gender] ?? g.gender}</span>
                    <span className="font-mono">{g._count._all} <span className="text-muted-foreground">({pct.toFixed(1)}%)</span></span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Sipas grupit të gjakut</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {byBlood.map((b) => {
              const pct = total > 0 ? (b._count._all / total) * 100 : 0;
              return (
                <div key={b.bloodType} className="flex items-center justify-between text-sm">
                  <span className="font-mono font-bold w-12">{bloodLabels[b.bloodType] ?? b.bloodType}</span>
                  <div className="flex-1 mx-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-destructive to-warning" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-mono w-12 text-right">{b._count._all}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top qytete</CardTitle></CardHeader>
          <CardContent>
            {byCity.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">—</div>
            ) : (
              <ul className="space-y-1.5">
                {byCity.map((c, i) => (
                  <li key={c.city ?? "n/a"} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">#{i + 1}</span>
                    <span className="flex-1 mx-2">{c.city ?? "—"}</span>
                    <span className="font-mono font-semibold">{c._count._all}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
