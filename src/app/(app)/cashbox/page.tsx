import { Wallet, ArrowDownCircle, ArrowUpCircle, Lock, Unlock, AlertTriangle } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { OpenCashboxButton, CloseCashboxButton } from "./cashbox-actions";

export const metadata = { title: "Arka" };
export const dynamic = "force-dynamic";

export default async function CashboxPage() {
  const db = await getDb();
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

  const [activeSession, todayPayments, todaySumAgg, recentSessions] = await Promise.all([
    db.cashboxSession.findFirst({
      where: { closedAt: null },
      orderBy: { openedAt: "desc" },
    }),
    db.payment.findMany({
      where: { paidAt: { gte: startOfDay } },
      orderBy: { paidAt: "desc" },
      include: { invoice: { include: { patient: true } } },
    }),
    db.payment.groupBy({
      by: ["method"],
      where: { paidAt: { gte: startOfDay } },
      _sum: { amount: true },
    }),
    db.cashboxSession.findMany({
      where: { closedAt: { not: null } },
      orderBy: { closedAt: "desc" },
      take: 5,
    }),
  ]);

  const total = todaySumAgg.reduce((s, p) => s + Number(p._sum.amount ?? 0), 0);
  const cash = Number(todaySumAgg.find((p) => p.method === "CASH")?._sum.amount ?? 0);
  const card = Number(todaySumAgg.find((p) => p.method === "CARD")?._sum.amount ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Arka Ditore"
        description="Sesioni i hapur, hyrjet e ditës dhe raportet financiare"
        breadcrumb={[{ label: "Financa" }, { label: "Arka" }]}
        actions={null}
      />

      {/* Active session banner */}
      {activeSession ? (
        <Card>
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-success/15 p-3">
                <Unlock className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="font-semibold">Arka është e hapur</div>
                <div className="text-xs text-muted-foreground">
                  Hapur më {formatDateTime(activeSession.openedAt)} · Float fillestar:{" "}
                  {formatCurrency(Number(activeSession.openingFloat))}
                </div>
              </div>
            </div>
            <CloseCashboxButton sessionId={activeSession.id} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-warning/15 p-3">
                <Lock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="font-semibold">Arka është e mbyllur</div>
                <div className="text-xs text-muted-foreground">
                  Hap arkën për të filluar pranimin e pagesave
                </div>
              </div>
            </div>
            <OpenCashboxButton />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total ditor" value={formatCurrency(total)} icon={Wallet} tone="primary" />
        <StatCard label="Kesh" value={formatCurrency(cash)} icon={ArrowDownCircle} tone="success" />
        <StatCard label="Kartë" value={formatCurrency(card)} icon={ArrowUpCircle} tone="info" />
        <StatCard label="Transaksione" value={String(todayPayments.length)} icon={Wallet} tone="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pagesat e sotme</CardTitle>
            <CardDescription>Të gjitha hyrjet e regjistruara sot</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {todayPayments.length === 0 ? (
              <div className="p-12">
                <EmptyState icon={Wallet} title="Asnjë transaksion sot" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Ora</th>
                      <th className="px-4 py-3">Pacienti</th>
                      <th className="px-4 py-3">Metoda</th>
                      <th className="px-4 py-3 text-right">Shuma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayPayments.map((p) => (
                      <tr key={p.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                        <td className="px-4 py-3 font-mono text-xs">{formatDateTime(p.paidAt)}</td>
                        <td className="px-4 py-3">
                          {p.invoice.patient.firstName} {p.invoice.patient.lastName}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{p.method}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-success">
                          {formatCurrency(Number(p.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">5 sesionet e fundit</CardTitle>
            <CardDescription>Mbylljet e arkës</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <EmptyState icon={Lock} title="Asnjë sesion i mbyllur" />
            ) : (
              <ul className="space-y-2">
                {recentSessions.map((s) => {
                  const variance = Number(s.variance ?? 0);
                  return (
                    <li key={s.id} className="rounded-lg border border-border/40 bg-card/40 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-mono">{formatDateTime(s.closedAt!)}</div>
                        {variance !== 0 && (
                          <Badge variant={Math.abs(variance) < 1 ? "success" : "warning"}>
                            <AlertTriangle className="h-3 w-3" />
                            {variance > 0 ? "+" : ""}
                            {formatCurrency(variance)}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pritej: {formatCurrency(Number(s.expectedCash ?? 0))} · Numëruar:{" "}
                        {formatCurrency(Number(s.closingCash ?? 0))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
