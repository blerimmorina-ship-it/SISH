"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  User,
  Building2,
  Stethoscope,
  Plus,
  X,
  Save,
  Loader2,
  Search,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface Option { id: string; name: string }
interface ServiceOption extends Option { price: number; code: string }
interface PatientOption { id: string; firstName: string; lastName: string; code: string; phone: string | null }

export interface VisitInitialValues {
  id: string;
  code: string;
  patient: PatientOption;
  departmentId: string;
  doctorId: string | null;
  scheduledAt: string;          // ISO
  reason: string | null;
  diagnosis: string | null;
  symptoms: string | null;
  notes: string | null;
  serviceIds: string[];
}

interface VisitFormProps {
  departments: Option[];
  doctors: Option[];
  services: ServiceOption[];
  defaultPatientId?: string;
  /** Nëse ka, formi është në mode edit dhe bën PATCH te /api/visits/{id} */
  initialVisit?: VisitInitialValues;
}

export function VisitForm({ departments, doctors, services, defaultPatientId, initialVisit }: VisitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(initialVisit);

  const [patientId, setPatientId] = useState(initialVisit?.patient.id ?? defaultPatientId ?? "");
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(
    initialVisit?.patient ?? null,
  );

  const [departmentId, setDepartmentId] = useState(
    initialVisit?.departmentId ?? departments[0]?.id ?? "",
  );
  const [doctorId, setDoctorId] = useState(initialVisit?.doctorId ?? "");
  const [scheduledAt, setScheduledAt] = useState(() => {
    if (initialVisit?.scheduledAt) {
      const d = new Date(initialVisit.scheduledAt);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    }
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [reason, setReason] = useState(initialVisit?.reason ?? "");
  const [diagnosis, setDiagnosis] = useState(initialVisit?.diagnosis ?? "");
  const [symptoms, setSymptoms] = useState(initialVisit?.symptoms ?? "");
  const [notes, setNotes] = useState(initialVisit?.notes ?? "");

  const [selectedServices, setSelectedServices] = useState<ServiceOption[]>(
    initialVisit
      ? initialVisit.serviceIds
          .map((sid) => services.find((s) => s.id === sid))
          .filter((s): s is ServiceOption => Boolean(s))
      : [],
  );
  const [serviceQuery, setServiceQuery] = useState("");

  // Patient lookup
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

  // Load default patient
  useEffect(() => {
    if (defaultPatientId && !selectedPatient) {
      fetch(`/api/patients/${defaultPatientId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.patient) {
            setSelectedPatient(data.patient);
            setPatientId(data.patient.id);
          }
        })
        .catch(() => {});
    }
  }, [defaultPatientId, selectedPatient]);

  function selectPatient(p: PatientOption) {
    setSelectedPatient(p);
    setPatientId(p.id);
    setPatientQuery("");
    setPatientResults([]);
  }

  function addService(s: ServiceOption) {
    if (!selectedServices.some((x) => x.id === s.id)) {
      setSelectedServices((prev) => [...prev, s]);
    }
  }
  function removeService(id: string) {
    setSelectedServices((prev) => prev.filter((s) => s.id !== id));
  }

  const filteredServices = services.filter(
    (s) =>
      !serviceQuery ||
      s.name.toLowerCase().includes(serviceQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(serviceQuery.toLowerCase()),
  );
  const totalAmount = selectedServices.reduce((s, x) => s + x.price, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) {
      toast.error("Zgjidh një pacient");
      return;
    }
    if (!departmentId) {
      toast.error("Zgjidh departamentin");
      return;
    }
    startTransition(async () => {
      try {
        const url = isEdit ? `/api/visits/${initialVisit!.id}` : "/api/visits";
        const method = isEdit ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            departmentId,
            doctorId: doctorId || null,
            scheduledAt: new Date(scheduledAt).toISOString(),
            reason,
            diagnosis,
            symptoms,
            notes,
            serviceIds: selectedServices.map((s) => s.id),
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? (isEdit ? "Përditësimi dështoi" : "Krijimi dështoi"));
          return;
        }
        toast.success(isEdit ? "Vizita u përditësua" : "Vizita u krijua");
        router.push(`/visits/${json.visit.id}` as never);
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" /> Pacienti
          </CardTitle>
          <CardDescription>Kërko sipas emrit, kodit ose telefonit</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedPatient ? (
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <div>
                <div className="font-medium">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {selectedPatient.code}
                  {selectedPatient.phone ? ` · ${selectedPatient.phone}` : ""}
                </div>
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
                      onClick={() => selectPatient(p)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-primary/10 text-left text-sm transition-colors"
                    >
                      <div>
                        <div className="font-medium">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p.code}
                          {p.phone ? ` · ${p.phone}` : ""}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visit details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarPlus className="h-4 w-4 text-primary" /> Detajet e vizitës
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Departamenti *
            </Label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40"
              required
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs">
              <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" /> Mjeku
            </Label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40"
            >
              <option value="">— Pa caktuar —</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="mb-1.5 text-xs">Data dhe ora *</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Arsyeja e vizitës</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="P.sh. Kontroll rutinë" />
          </div>

          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Simptomat</Label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
              placeholder="Përshkruaj simptomat e pacientit…"
            />
          </div>

          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Diagnoza</Label>
            <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Diagnoza klinike" />
          </div>

          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Shënime</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-primary" /> Shërbimet
          </CardTitle>
          <CardDescription>{selectedServices.length} të zgjedhura · Total {formatCurrency(totalAmount)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Kërko shërbim…"
            value={serviceQuery}
            onChange={(e) => setServiceQuery(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto scroll-thin">
            {filteredServices.slice(0, 12).map((s) => {
              const sel = selectedServices.some((x) => x.id === s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => (sel ? removeService(s.id) : addService(s))}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                    sel
                      ? "border-primary/40 bg-primary/10"
                      : "border-border/40 bg-card/40 hover:border-primary/30"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{s.code}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm">{formatCurrency(s.price)}</span>
                    {sel ? <X className="h-4 w-4 text-destructive" /> : <Plus className="h-4 w-4 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedServices.length > 0 && (
            <div className="border-t border-border/40 pt-3 space-y-2">
              {selectedServices.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{s.code}</Badge>
                    <span>{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono">{formatCurrency(s.price)}</span>
                    <button type="button" onClick={() => removeService(s.id)} aria-label="Hiq">
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border/40 pt-2 text-base font-semibold">
                <span>Total</span>
                <span className="text-gradient text-xl">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Anulo
        </Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> {isEdit ? "Ruaj ndryshimet" : "Ruaj vizitën"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
