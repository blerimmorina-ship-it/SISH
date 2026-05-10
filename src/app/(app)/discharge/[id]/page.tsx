import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Printer, Edit, CheckCircle2 } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DischargeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  const sheet = await db.dischargeSheet.findUnique({ where: { id } });
  if (!sheet) notFound();

  const patient = await db.patient.findUnique({ where: { id: sheet.patientId } });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Fletëlëshim ${sheet.number}`}
        description={patient ? `${patient.firstName} ${patient.lastName}` : ""}
        breadcrumb={[
          { label: "Klinika" },
          { label: "Fletëlëshimet", href: "/discharge" },
          { label: sheet.number },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/discharge"><ArrowLeft className="h-4 w-4" /> Kthehu</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/discharge/${sheet.id}/print`}><Printer className="h-4 w-4" /> Printo</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/discharge/${sheet.id}/edit`}><Edit className="h-4 w-4" /> Edito</Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Përmbledhja
            </span>
            {sheet.signedAt ? (
              <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> E nënshkruar</Badge>
            ) : (
              <Badge variant="warning">E panënshkruar</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Pranuar më</div>
              <div className="mt-1 font-medium">{formatDateTime(sheet.admittedAt)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Lëshuar më</div>
              <div className="mt-1 font-medium">
                {sheet.dischargedAt ? formatDateTime(sheet.dischargedAt) : "—"}
              </div>
            </div>
            {sheet.followUpDate && (
              <div className="col-span-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Vizita kontrolluese</div>
                <div className="mt-1 font-medium">{formatDate(sheet.followUpDate)}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Diagnoza</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Primare</div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 font-medium">
              {sheet.primaryDiagnosis}
            </div>
          </div>
          {sheet.secondaryDiagnoses && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Sekondare</div>
              <div className="rounded-lg bg-muted/30 border border-border/40 px-4 py-3 whitespace-pre-wrap">
                {sheet.secondaryDiagnoses}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {sheet.treatmentSummary && (
        <Card>
          <CardHeader><CardTitle className="text-base">Përmbledhja e trajtimit</CardTitle></CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">{sheet.treatmentSummary}</div>
          </CardContent>
        </Card>
      )}

      {sheet.recommendations && (
        <Card>
          <CardHeader><CardTitle className="text-base">Rekomandime</CardTitle></CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">{sheet.recommendations}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
