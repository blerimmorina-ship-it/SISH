"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileSignature, Plus, Trash2, Save, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface ServiceOption { id: string; name: string; code: string; price: number }
interface QItem { id: string; description: string; quantity: number; unitPrice: number; discount: number }

let counter = 0;
const newId = () => `qi-${++counter}`;

export function QuoteForm({ services }: { services: ServiceOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const inMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [validFrom, setValidFrom] = useState(today);
  const [validUntil, setValidUntil] = useState(inMonth);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [vatRate, setVatRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(
    "Kjo ofertë është e vlefshme deri në datën e specifikuar. Çmimet janë në Euro dhe nuk përfshijnë taksa shtesë përveç TVSH-së.",
  );

  const [items, setItems] = useState<QItem[]>([
    { id: newId(), description: "", quantity: 1, unitPrice: 0, discount: 0 },
  ]);
  const [serviceQuery, setServiceQuery] = useState("");
  const filtered = services
    .filter((s) => !serviceQuery || s.name.toLowerCase().includes(serviceQuery.toLowerCase()))
    .slice(0, 6);

  function addService(s: ServiceOption) {
    setItems((prev) => [
      ...prev.filter((i) => i.description || i.unitPrice),
      { id: newId(), description: s.name, quantity: 1, unitPrice: s.price, discount: 0 },
    ]);
    setServiceQuery("");
  }

  const subtotal = items.reduce((s, i) => s + (i.unitPrice * i.quantity - i.discount), 0);
  const vat = (subtotal * vatRate) / 100;
  const total = Math.max(0, subtotal + vat - globalDiscount);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return toast.error("Shto titullin");
    const realItems = items.filter((i) => i.description && i.unitPrice >= 0);
    if (realItems.length === 0) return toast.error("Shto të paktën një artikull");

    startTransition(async () => {
      try {
        const res = await fetch("/api/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            patientName: patientName || null,
            patientPhone: patientPhone || null,
            validFrom,
            validUntil,
            items: realItems,
            globalDiscount,
            vatRate,
            notes,
            terms,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Krijimi dështoi");
          return;
        }
        toast.success("Oferta u krijua");
        router.push("/quotes");
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
            <FileSignature className="h-4 w-4 text-primary" /> Të dhënat e ofertës
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Titulli *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="P.sh. Pakoja Premium Stomatologjike" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Emri i pacientit / prospektit</Label>
            <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Telefoni</Label>
            <Input value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="+383 ..." />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Vlefshme nga</Label>
            <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Vlefshme deri</Label>
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Artikujt</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Shto shërbim ekzistues…"
              value={serviceQuery}
              onChange={(e) => setServiceQuery(e.target.value)}
            />
            {serviceQuery && filtered.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border/60 bg-popover/95 backdrop-blur-xl shadow-premium overflow-hidden">
                {filtered.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addService(s)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-primary/10 text-sm text-left"
                  >
                    <span>{s.name}</span>
                    <span className="font-mono">{formatCurrency(s.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-2 py-2 text-left">Përshkrimi</th>
                <th className="px-2 py-2 text-right w-20">Sasia</th>
                <th className="px-2 py-2 text-right w-28">Çmimi</th>
                <th className="px-2 py-2 text-right w-24">Zbritje</th>
                <th className="px-2 py-2 text-right w-28">Total</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const lineTotal = it.unitPrice * it.quantity - it.discount;
                return (
                  <tr key={it.id} className="border-b border-border/30 last:border-b-0">
                    <td className="px-2 py-1.5">
                      <Input value={it.description} onChange={(e) => setItems((p) => p.map((x) => x.id === it.id ? { ...x, description: e.target.value } : x))} className="h-8" />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input type="number" min={1} value={it.quantity} onChange={(e) => setItems((p) => p.map((x) => x.id === it.id ? { ...x, quantity: Number(e.target.value) } : x))} className="h-8 text-right" />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input type="number" step="0.01" value={it.unitPrice} onChange={(e) => setItems((p) => p.map((x) => x.id === it.id ? { ...x, unitPrice: Number(e.target.value) } : x))} className="h-8 text-right" />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input type="number" step="0.01" value={it.discount} onChange={(e) => setItems((p) => p.map((x) => x.id === it.id ? { ...x, discount: Number(e.target.value) } : x))} className="h-8 text-right" />
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono">{formatCurrency(lineTotal)}</td>
                    <td className="px-2 py-1.5">
                      <button type="button" onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))} aria-label="Hiq">
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Button type="button" variant="ghost" size="sm" onClick={() => setItems((p) => [...p, { id: newId(), description: "", quantity: 1, unitPrice: 0, discount: 0 }])}>
            <Plus className="h-4 w-4" /> Shto rresht
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Përmbledhja</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 text-xs">TVSH %</Label>
              <Input type="number" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))} />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Zbritje globale</Label>
              <Input type="number" step="0.01" value={globalDiscount} onChange={(e) => setGlobalDiscount(Number(e.target.value))} />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Shënime</Label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Termat dhe kushtet</Label>
              <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{formatCurrency(subtotal)}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">TVSH ({vatRate}%)</span><span className="font-mono">{formatCurrency(vat)}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Zbritje</span><span className="font-mono">−{formatCurrency(globalDiscount)}</span></div>
            <div className="flex items-center justify-between border-t border-border/40 pt-2"><span className="font-semibold">Total</span><span className="font-mono text-2xl font-bold text-gradient">{formatCurrency(total)}</span></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anulo</Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…</> : <><Save className="h-4 w-4" /> Krijo ofertën</>}
        </Button>
      </div>
    </form>
  );
}
