"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Search, X, Save, Loader2, Clock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

interface Option { id: string; name: string }
interface PatientOption { id: string; firstName: string; lastName: string; code: string; phone: string | null }

export function AppointmentForm({ doctors }: { doctors: Option[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [patientId, setPatientId] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  // New patient inline fields
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDob, setNewDob] = useState("");

  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset() + 30);
    return d.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState(30);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

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
    if (!doctorId) {
      toast.error("Zgjidh mjekun");
      return;
    }
    if (mode === "existing" && !patientId) {
      toast.error("Zgjidh pacientin");
      return;
    }
    if (mode === "new" && (!newFirstName || !newLastName)) {
      toast.error("Plotëso emrin dhe mbiemrin e pacientit të ri");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId,
            scheduledAt: new Date(scheduledAt).toISOString(),
            durationMin: duration,
            reason,
            notes,
            patientId: mode === "existing" ? patientId : null,
            newPatient:
              mode === "new"
                ? { firstName: newFirstName, lastName: newLastName, phone: newPhone, dateOfBirth: newDob }
                : null,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Krijimi dështoi");
          return;
        }
        toast.success("Termini u krijua");
        router.push("/appointments");
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
            <CalendarPlus className="h-4 w-4 text-primary" /> Pacienti
          </CardTitle>
          <CardDescription>Zgjedh pacient ekzistues ose krijo një të ri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="inline-flex rounded-lg bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "existing" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Pacient ekzistues
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "new" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <UserPlus className="inline h-3 w-3 mr-1" /> Pacient i ri
            </button>
          </div>

          {mode === "existing" ? (
            selectedPatient ? (
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <div>
                  <div className="font-medium">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </div>
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
                        <div className="text-xs text-muted-foreground">{p.code}{p.phone ? ` · ${p.phone}` : ""}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 text-xs">Emri *</Label>
                <Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} required />
              </div>
              <div>
                <Label className="mb-1.5 text-xs">Mbiemri *</Label>
                <Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} required />
              </div>
              <div>
                <Label className="mb-1.5 text-xs">Telefoni</Label>
                <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+383 ..." />
              </div>
              <div>
                <Label className="mb-1.5 text-xs">Datëlindja</Label>
                <Input type="date" value={newDob} onChange={(e) => setNewDob(e.target.value)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detajet e terminit</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Mjeku *</Label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Kohëzgjatja (min)</Label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40"
            >
              {[15, 20, 30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" /> Data dhe ora *
            </Label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Arsyeja</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
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

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anulo</Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…</>
          ) : (
            <><Save className="h-4 w-4" /> Ruaj terminin</>
          )}
        </Button>
      </div>
    </form>
  );
}
