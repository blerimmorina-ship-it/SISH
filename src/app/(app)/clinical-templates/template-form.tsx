"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Save, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const CATEGORIES = [
  { code: "SYMPTOM", label: "Ankesat / Simptomat" },
  { code: "EXAM", label: "Ekzaminimet" },
  { code: "DIAGNOSIS", label: "Diagnozat" },
  { code: "THERAPY", label: "Terapitë" },
  { code: "ANALYSIS", label: "Analizat e kërkuara" },
  { code: "ADVICE", label: "Këshillat për pacientin" },
  { code: "CONTROL", label: "Kontrollat e ardhshme" },
  { code: "NOTE", label: "Shënime klinike" },
];

const PLACEHOLDERS = [
  { code: "{{patient_name}}", label: "Emri i pacientit" },
  { code: "{{patient_age}}", label: "Mosha" },
  { code: "{{patient_gender}}", label: "Gjinia" },
  { code: "{{visit_date}}", label: "Data e vizitës" },
  { code: "{{doctor_name}}", label: "Mjeku" },
  { code: "{{department}}", label: "Departamenti" },
];

export function ClinicalTemplateForm({ departments }: { departments: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [category, setCategory] = useState("SYMPTOM");
  const [departmentId, setDepartmentId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [shortcut, setShortcut] = useState("");
  const [icd10, setIcd10] = useState("");

  function insertPlaceholder(p: string) {
    setBody((prev) => prev + p);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !body) return toast.error("Plotëso titullin dhe tekstin");

    startTransition(async () => {
      try {
        const res = await fetch("/api/clinical-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            departmentId: departmentId || null,
            title,
            body,
            shortcut: shortcut || null,
            icd10: icd10 || null,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Krijimi dështoi");
          return;
        }
        toast.success("Shablloni u krijua");
        router.push("/clinical-templates");
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
            <FileText className="h-4 w-4 text-primary" /> Të dhënat e shabllonit
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Kategoria *</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40"
            >
              {CATEGORIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Departamenti</Label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40"
            >
              <option value="">— Të gjitha departamentet —</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Titulli *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="P.sh. Dhimbje e fortë koke me të vjella"
            />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Shkurtore (opsionale)</Label>
            <Input
              value={shortcut}
              onChange={(e) => setShortcut(e.target.value)}
              placeholder="P.sh. dh-koke"
              maxLength={20}
            />
          </div>
          {category === "DIAGNOSIS" && (
            <div>
              <Label className="mb-1.5 text-xs">Kodi ICD-10</Label>
              <Input
                value={icd10}
                onChange={(e) => setIcd10(e.target.value.toUpperCase())}
                placeholder="P.sh. G43.1"
                maxLength={10}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> Teksti i shabllonit
          </CardTitle>
          <CardDescription>
            Përdor variabla si <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">{"{{patient_name}}"}</code> që zëvendësohen automatikisht kur shablloni futet në vizitë.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            required
            className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40 font-mono"
            placeholder="P.sh. Pacienti {{patient_name}}, {{patient_age}} vjeç, paraqitet me dhimbje..."
          />
          <div>
            <Label className="mb-1.5 text-xs">Variabla të disponueshme (kliko për të shtuar)</Label>
            <div className="flex flex-wrap gap-1.5">
              {PLACEHOLDERS.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => insertPlaceholder(p.code)}
                  className="rounded-md border border-border/40 bg-card/60 px-2 py-1 text-xs font-mono hover:border-primary/40 hover:bg-primary/10 transition-colors"
                  title={p.label}
                >
                  {p.code}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anulo</Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…</> : <><Save className="h-4 w-4" /> Ruaj shabllonin</>}
        </Button>
      </div>
    </form>
  );
}
