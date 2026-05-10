"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TestTube2, Search, X, Save, Loader2, AlertOctagon, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface DeptOption { id: string; name: string }
interface TemplateOption {
  id: string;
  serviceId: string;
  name: string;
  code: string;
  category: string;
  parametersCount: number;
  price: number;
}
interface PatientOption { id: string; firstName: string; lastName: string; code: string; phone: string | null }

export function LabOrderForm({
  departments,
  templates,
  defaultPatientId,
  defaultVisitId,
}: {
  departments: DeptOption[];
  templates: TemplateOption[];
  defaultPatientId?: string;
  defaultVisitId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [priority, setPriority] = useState<"normal" | "urgent" | "stat">("normal");
  const [clinicalInfo, setClinicalInfo] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedTemplates, setSelectedTemplates] = useState<TemplateOption[]>([]);
  const [tplQuery, setTplQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Të gjitha");

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

  const categories = Array.from(new Set(templates.map((t) => t.category)));
  const filteredTemplates = templates.filter(
    (t) =>
      (activeCategory === "Të gjitha" || t.category === activeCategory) &&
      (!tplQuery ||
        t.name.toLowerCase().includes(tplQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(tplQuery.toLowerCase())),
  );

  function toggleTemplate(t: TemplateOption) {
    setSelectedTemplates((prev) =>
      prev.some((x) => x.id === t.id) ? prev.filter((x) => x.id !== t.id) : [...prev, t],
    );
  }

  const totalAmount = selectedTemplates.reduce((s, t) => s + t.price, 0);
  const totalParams = selectedTemplates.reduce((s, t) => s + t.parametersCount, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return toast.error("Zgjidh pacientin");
    if (selectedTemplates.length === 0) return toast.error("Zgjidh të paktën një analizë");

    startTransition(async () => {
      try {
        const res = await fetch("/api/lab-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            departmentId,
            visitId: defaultVisitId || null,
            priority,
            clinicalInfo,
            notes,
            templateIds: selectedTemplates.map((t) => t.id),
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Krijimi dështoi");
          return;
        }
        toast.success("Urdhri laboratorik u krijua");
        router.push(`/lab/orders/${json.order.id}` as never);
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
            <TestTube2 className="h-4 w-4 text-primary" /> Pacienti & Departamenti
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
              <Input
                icon={<Search className="h-4 w-4" />}
                placeholder="Kërko pacient…"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
              />
              {patientResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border/60 bg-popover/95 backdrop-blur-xl shadow-premium overflow-hidden">
                  {patientResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(p);
                        setPatientId(p.id);
                        setPatientQuery("");
                        setPatientResults([]);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-primary/10 text-sm"
                    >
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
              <Label className="mb-1.5 text-xs">Departamenti *</Label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40"
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Prioriteti</Label>
              <div className="flex gap-2">
                {[
                  { v: "normal", label: "Normal", tone: "" },
                  { v: "urgent", label: "Urgjent", tone: "warning" },
                  { v: "stat", label: "STAT", tone: "destructive" },
                ].map((p) => (
                  <button
                    key={p.v}
                    type="button"
                    onClick={() => setPriority(p.v as never)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      priority === p.v
                        ? p.v === "stat"
                          ? "border-destructive/50 bg-destructive/10 text-destructive"
                          : p.v === "urgent"
                            ? "border-warning/50 bg-warning/10 text-warning"
                            : "border-primary/50 bg-primary/10 text-primary"
                        : "border-border/40 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {p.v === "stat" && <AlertOctagon className="inline h-3 w-3 mr-1" />}
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-1.5 text-xs">Informacion klinik</Label>
            <textarea
              value={clinicalInfo}
              onChange={(e) => setClinicalInfo(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
              placeholder="Diagnoza dyshuese ose informacion klinik për laborantin…"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FlaskConical className="h-4 w-4 text-primary" /> Analizat e zgjedhura
          </CardTitle>
          <CardDescription>
            {selectedTemplates.length} analiza · {totalParams} parametra · Total {formatCurrency(totalAmount)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Kërko analizë…"
            value={tplQuery}
            onChange={(e) => setTplQuery(e.target.value)}
          />

          <div className="flex flex-wrap gap-1.5">
            {(["Të gjitha", ...categories]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategory === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto scroll-thin">
            {filteredTemplates.map((t) => {
              const sel = selectedTemplates.some((x) => x.id === t.id);
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => toggleTemplate(t)}
                  className={`text-left rounded-lg border p-3 text-sm transition-all ${
                    sel
                      ? "border-primary/40 bg-primary/10"
                      : "border-border/40 bg-card/40 hover:border-primary/30"
                  }`}
                >
                  <div className="font-medium truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{t.code}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <Badge variant="outline">{t.parametersCount} parametra</Badge>
                    <span className="font-mono text-xs">{formatCurrency(t.price)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anulo</Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…</> : <><Save className="h-4 w-4" /> Krijo urdhrin</>}
        </Button>
      </div>
    </form>
  );
}
