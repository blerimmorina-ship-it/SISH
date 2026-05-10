"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Save, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function WarehouseForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !code) return toast.error("Plotëso emrin dhe kodin");
    startTransition(async () => {
      try {
        const res = await fetch("/api/warehouses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, code, address: address || null }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Krijimi dështoi");
          return;
        }
        toast.success("Depoja u krijua");
        router.push("/inventory/warehouses");
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
            <Building2 className="h-4 w-4 text-primary" /> Detajet e depos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Emri i depos *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="P.sh. Depo Kryesore" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Kodi *</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="WH-MAIN" />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs"><MapPin className="h-3.5 w-3.5" /> Adresa / lokacioni</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="P.sh. Kati përdhe, Salla 1" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anulo</Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…</> : <><Save className="h-4 w-4" /> Ruaj depon</>}
        </Button>
      </div>
    </form>
  );
}
