"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Truck, Save, Loader2, Building, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function SupplierForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return toast.error("Plotëso emrin");
    startTransition(async () => {
      try {
        const res = await fetch("/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, taxId: taxId || null, contactName: contactName || null, phone: phone || null, email: email || null, address: address || null, notes: notes || null }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Krijimi dështoi");
          return;
        }
        toast.success("Furnizuesi u krijua");
        router.push("/inventory/suppliers");
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
            <Truck className="h-4 w-4 text-primary" /> Të dhënat e furnizuesit
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs"><Building className="h-3.5 w-3.5" /> Emri i kompanisë *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="P.sh. MediSupply Sh.p.k." />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Numri tatimor (NUI)</Label>
            <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="810000000" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Personi i kontaktit</Label>
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Emri i plotë" />
          </div>
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs"><Phone className="h-3.5 w-3.5" /> Telefoni</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+383 ..." />
          </div>
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs"><Mail className="h-3.5 w-3.5" /> Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kontakt@kompani.com" />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Adresa</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Shënime</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anulo</Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…</> : <><Save className="h-4 w-4" /> Ruaj furnizuesin</>}
        </Button>
      </div>
    </form>
  );
}
