"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Search, X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface ServiceOption { id: string; name: string; code: string; price: number; vatRate: number }
interface PatientOption { id: string; firstName: string; lastName: string; code: string; phone: string | null }

interface Item {
  id: string; // local
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatRate: number;
}

let counter = 0;
const newId = () => `item-${++counter}`;

export function InvoiceForm({
  services,
  defaultPatientId,
  defaultVisitId,
}: {
  services: ServiceOption[];
  defaultPatientId?: string;
  defaultVisitId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  const [items, setItems] = useState<Item[]>([
    { id: newId(), description: "", quantity: 1, unitPrice: 0, discount: 0, vatRate: 0 },
  ]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [issueNow, setIssueNow] = useState(true);

  const [serviceQuery, setServiceQuery] = useState("");
  const filteredServices = services
    .filter(
      (s) =>
        !serviceQuery ||
        s.name.toLowerCase().includes(serviceQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(serviceQuery.toLowerCase()),
    )
    .slice(0, 8);

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

  function addServiceAsItem(s: ServiceOption) {
    setItems((prev) => [
      ...prev.filter((i) => i.description || i.unitPrice),
      {
        id: newId(),
        description: s.name,
        quantity: 1,
        unitPrice: s.price,
        discount: 0,
        vatRate: s.vatRate,
      },
    ]);
    setServiceQuery("");
  }

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }
  function addBlankItem() {
    setItems((prev) => [...prev, { id: newId(), description: "", quantity: 1, unitPrice: 0, discount: 0, vatRate: 0 }]);
  }

  // Totals
  const subtotal = items.reduce((s, i) => s + (i.unitPrice * i.quantity - i.discount), 0);
  const vat = items.reduce((s, i) => s + ((i.unitPrice * i.quantity - i.discount) * i.vatRate) / 100, 0);
  const total = Math.max(0, subtotal + vat - globalDiscount);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return toast.error("Zgjidh pacientin");
    const realItems = items.filter((i) => i.description && i.unitPrice >= 0 && i.quantity > 0);
    if (realItems.length === 0) return toast.error("Shto të paktën një artikull");

    startTransition(async () => {
      try {
        const res = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            visitId: defaultVisitId ?? null,
            items: realItems,
            globalDiscount,
            notes,
            dueDate: dueDate || null,
            issueNow,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Krijimi dështoi");
          return;
        }
        toast.success("Fatura u krijua");
        router.push(`/billing/${json.invoice.id}` as never);
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
            <Receipt className="h-4 w-4 text-primary" /> Pacienti
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Artikujt</CardTitle>
          <CardDescription>Shto shërbime ose artikuj manualisht</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Shto shërbim ekzistues…"
              value={serviceQuery}
              onChange={(e) => setServiceQuery(e.target.value)}
            />
            {serviceQuery && filteredServices.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border/60 bg-popover/95 backdrop-blur-xl shadow-premium overflow-hidden">
                {filteredServices.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addServiceAsItem(s)}
                    className="w-full text-left px-4 py-2 hover:bg-primary/10 text-sm flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{s.code}</div>
                    </div>
                    <span className="font-mono text-sm">{formatCurrency(s.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-2 py-2 text-left">Përshkrimi</th>
                  <th className="px-2 py-2 text-right w-20">Sasia</th>
                  <th className="px-2 py-2 text-right w-28">Çmimi</th>
                  <th className="px-2 py-2 text-right w-24">Zbritje</th>
                  <th className="px-2 py-2 text-right w-20">TVSH %</th>
                  <th className="px-2 py-2 text-right w-28">Totali</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const lineSub = it.unitPrice * it.quantity - it.discount;
                  const lineTotal = lineSub + (lineSub * it.vatRate) / 100;
                  return (
                    <tr key={it.id} className="border-b border-border/30 last:border-b-0">
                      <td className="px-2 py-1.5">
                        <Input
                          value={it.description}
                          onChange={(e) => updateItem(it.id, { description: e.target.value })}
                          className="h-8"
                          placeholder="Përshkrimi"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) })}
                          className="h-8 text-right"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          value={it.unitPrice}
                          onChange={(e) => updateItem(it.id, { unitPrice: Number(e.target.value) })}
                          className="h-8 text-right"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          value={it.discount}
                          onChange={(e) => updateItem(it.id, { discount: Number(e.target.value) })}
                          className="h-8 text-right"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          type="number"
                          value={it.vatRate}
                          onChange={(e) => updateItem(it.id, { vatRate: Number(e.target.value) })}
                          className="h-8 text-right"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono">{formatCurrency(lineTotal)}</td>
                      <td className="px-2 py-1.5">
                        <button type="button" onClick={() => removeItem(it.id)} aria-label="Hiq">
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={addBlankItem}>
            <Plus className="h-4 w-4" /> Shto rresht
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Përmbledhja</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 text-xs">Zbritje globale (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={globalDiscount}
                onChange={(e) => setGlobalDiscount(Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Afati i pagesës</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Shënime</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={issueNow}
                onChange={(e) => setIssueNow(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary"
              />
              Lësho menjëherë (gjendje "Issued")
            </label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">TVSH</span>
              <span className="font-mono">{formatCurrency(vat)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Zbritje</span>
              <span className="font-mono">−{formatCurrency(globalDiscount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-2">
              <span className="text-base font-semibold">Total</span>
              <span className="font-mono text-2xl font-bold text-gradient">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anulo</Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…</> : <><Save className="h-4 w-4" /> Krijo faturën</>}
        </Button>
      </div>
    </form>
  );
}
