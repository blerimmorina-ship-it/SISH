"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, X, Save, Loader2, Calendar, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface PatientOption { id: string; firstName: string; lastName: string; code: string; phone: string | null }

export function DischargeForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [patientId, setPatientId] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  const [admittedAt, setAdmittedAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [dischargedAt, setDischargedAt] = useState("");
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("");
  const [secondaryDiagnoses, setSecondaryDiagnoses] = useState("");
  const [treatmentSummary, setTreatmentSummary] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  useEffect(() => {
    if (!patientQuery || patientQuery.length < 2) {
      setPatientResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/patients?q=${encodeURIComponent(patientQuery)}&take=8`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setPatientResults(data.items ?? []);
      } catch {}
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [patientQuery]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return toast.error("Zgjidh pacientin");
    if (!primaryDiagnosis) return toast.error("Shto diagnozën primare");

    startTransition(async () => {
      try {
        const res = await fetch("/api/discharge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            admittedAt: new Date(admittedAt).toISOString(),
            dischargedAt: dischargedAt ? new Date(dischargedAt).toISOString() : null,
            primaryDiagnosis,
            secondaryDiagnoses,
            treatmentSummary,
            recommendations,
            followUpDate: followUpDate || null,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Krijimi dështoi");
          return;
        }
        toast.success("Fletëlëshimi u krijua");
        router.push("/discharge");
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" /> Pacienti & datat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPatient ? (
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <div>
                <div className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                <div className="text-xs text-muted-foreground font-mono">{selectedPatient.code}</div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                <X className="h-4 w-4" /> Ndrysho
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Input icon={<Search className="h-4 w-4" />} placeholder="Kërko pacient…" value={patientQuery} onChange={(e) => setPatientQuery(e.target.value)} />
              {patientResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border/60 bg-popover/95 backdrop-blur-xl shadow-premium overflow-hidden">
                  {patientResults.map((p) => (
                    <button key={p.id} type="button" onClick={() => { setSelectedPatient(p); setPatientId(p.id); setPatientQuery(""); setPatientResults([]); }} className="w-full text-left px-4 py-2 hover:bg-primary/10 text-sm">
                      <div className="font-medium">{p.firstName} {p.lastName}</div>
                      <div className="text-xs text-muted-foreground">{p.code}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 flex items-center gap-1.5 text-xs"><Calendar className="h-3.5 w-3.5" /> Pranuar më *</Label>
              <Input type="datetime-local" value={admittedAt} onChange={(e) => setAdmittedAt(e.target.value)} required />
            </div>
            <div>
              <Label className="mb-1.5 flex items-center gap-1.5 text-xs"><Calendar className="h-3.5 w-3.5" /> Lëshuar më</Label>
              <Input type="datetime-local" value={dischargedAt} onChange={(e) => setDischargedAt(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1.5 flex items-center gap-1.5 text-xs"><Calendar className="h-3.5 w-3.5" /> Vizita kontrolluese</Label>
              <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4 text-primary" /> Diagnoza & trajtimi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-1.5 text-xs">Diagnoza primare *</Label>
            <Input value={primaryDiagnosis} onChange={(e) => setPrimaryDiagnosis(e.target.value)} required placeholder="P.sh. Hipertension arterial" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Diagnoza sekondare</Label>
            <textarea value={secondaryDiagnoses} onChange={(e) => setSecondaryDiagnoses(e.target.value)} rows={2} className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Përmbledhja e trajtimit</Label>
            <textarea value={treatmentSummary} onChange={(e) => setTreatmentSummary(e.target.value)} rows={4} className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Rekomandime</Label>
            <textarea value={recommendations} onChange={(e) => setRecommendations(e.target.value)} rows={4} className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anulo</Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…</> : <><Save className="h-4 w-4" /> Ruaj fletëlëshimin</>}
        </Button>
      </div>
    </form>
  );
}
