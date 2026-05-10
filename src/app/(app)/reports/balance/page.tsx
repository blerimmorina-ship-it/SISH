import Link from "next/link";
import { Wallet, PieChart, BarChart3, TrendingUp, TestTube2, ArrowUpCircle, ArrowDownCircle, FileDown } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Bilanci financiar" };
export const dynamic = "force-dynamic";

const TABS = [
  { href: "/reports", label: "Përmbledhja", icon: PieChart },
  { href: "/reports/analytics", label: "Analiza", icon: BarChart3 },
  { href: "/reports/revenue", label: "Të ardhurat", icon: TrendingUp },
  { href: "/reports/balance", label: "Bilanci financiar", icon: Wallet, active: true },
  { href: "/reports/lab-stats", label: "Laboratori", icon: TestTube2 },
];

export default async function BalancePage() {
  const db = await getDb();
  const [invoiced, paid, due, refunded, expensesAgg] = await Promise.all([
    db.invoice.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    db.payment.aggregate({ _sum: { amount: true } }),
    db.invoice.aggregate({ _sum: { balance: true }, where: { status: { in: ["ISSUED", "PARTIALLY_PAID"] } } }),
    db.invoice.aggregate({ _sum: { total: true }, where: { status: "REFUNDED" } }),
    db.purchase.aggregate({ _sum: { total: true }, where: { status: "RECEIVED" } }),
  ]);

  const totalInvoiced = Number(invoiced._sum.total ?? 0);
  const totalPaid = Number(paid._sum.amount ?? 0);
  const totalDue = Number(due._sum.balance ?? 0);
  const totalRefunded = Number(refunded._sum.total ?? 0);
  const totalExpenses = Number(expensesAgg._sum.total ?? 0);
  const netBalance = totalPaid - totalRefunded - totalExpenses;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bilanci financiar"
        description="Pamje e plotë e financave të klinikës"
        actions={<Button variant="outline" size="sm"><FileDown className="h-4 w-4" /> Eksporto</Button>}
      />

      <div className="flex flex-wrap gap-1 border-b border-border/60 -mb-px overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href as never}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                t.active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bilanci neto</CardTitle>
          <CardDescription>Të ardhurat minus shpenzimet dhe rimbursimet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-5xl font-bold tracking-tight ${netBalance >= 0 ? "text-gradient" : "text-destructive"}`}>
            {formatCurrency(netBalance)}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {netBalance >= 0 ? "✅ Pozitiv" : "⚠️ Negativ"} — bazuar te të dhënat aktuale
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total i faturuar" value={totalInvoiced} icon={Wallet} tone="primary" />
        <Stat label="Total i arkëtuar" value={totalPaid} icon={ArrowUpCircle} tone="success" />
        <Stat label="Borxh i hapur" value={totalDue} icon={ArrowDownCircle} tone="warning" />
        <Stat label="Shpenzime (blerje)" value={totalExpenses} icon={ArrowDownCircle} tone="destructive" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bilanci sipas zërave</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Zëri</th>
                <th className="px-4 py-3">Kategoria</th>
                <th className="px-4 py-3 text-right">Shuma</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Fatura të lëshuara" cat="Hyrje" amount={totalInvoiced} positive />
              <Row label="Pagesa të arkëtuara" cat="Hyrje" amount={totalPaid} positive />
              <Row label="Borxh nga pacientët" cat="Pasiv" amount={totalDue} />
              <Row label="Rimbursime" cat="Dalje" amount={-totalRefunded} />
              <Row label="Blerje (stoku)" cat="Dalje" amount={-totalExpenses} />
              <tr className="border-t-2 border-primary/40 bg-primary/5">
                <td className="px-4 py-3 font-bold">BILANCI NETO</td>
                <td className="px-4 py-3"></td>
                <td className={`px-4 py-3 text-right font-mono font-bold text-lg ${netBalance >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatCurrency(netBalance)}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ElementType; tone: string }) {
  const tones: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 [&_.tone]:text-primary",
    success: "from-success/15 to-success/5 [&_.tone]:text-success",
    warning: "from-warning/15 to-warning/5 [&_.tone]:text-warning",
    destructive: "from-destructive/15 to-destructive/5 [&_.tone]:text-destructive",
  };
  return (
    <div className={`rounded-xl bg-gradient-to-br ${tones[tone]} border border-border/40 p-4`}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="tone h-4 w-4" />
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight tone">{formatCurrency(value)}</div>
    </div>
  );
}

function Row({ label, cat, amount, positive }: { label: string; cat: string; amount: number; positive?: boolean }) {
  const isPositive = positive ?? amount >= 0;
  return (
    <tr className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
      <td className="px-4 py-3">{label}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{cat}</td>
      <td className={`px-4 py-3 text-right font-mono ${isPositive ? "text-success" : "text-destructive"}`}>
        {amount >= 0 ? "+" : "−"}{formatCurrency(Math.abs(amount))}
      </td>
    </tr>
  );
}
