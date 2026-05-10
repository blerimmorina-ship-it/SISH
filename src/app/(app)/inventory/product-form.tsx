"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Option { id: string; name: string }

export function ProductForm({ categories, warehouses }: { categories: Option[]; warehouses: Option[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("copë");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [vatRate, setVatRate] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [initialStock, setInitialStock] = useState(0);
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || !name) return toast.error("Plotëso kodin dhe emrin");

    startTransition(async () => {
      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code, name, unit, barcode: barcode || null, categoryId: categoryId || null,
            buyPrice, sellPrice, vatRate, minStock, description: description || null,
            warehouseId: warehouseId || null, initialStock,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Krijimi dështoi");
          return;
        }
        toast.success("Produkti u krijua");
        router.push("/inventory/products");
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  const margin = sellPrice > 0 ? ((sellPrice - buyPrice) / sellPrice) * 100 : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PackageSearch className="h-4 w-4 text-primary" /> Identifikimi
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Kodi *</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} required placeholder="P.sh. DRG-PARA-500" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Barcode</Label>
            <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="EAN/UPC" />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Emri *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="P.sh. Paracetamol 500mg" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Kategoria</Label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
              <option value="">— Asnjë —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Njësia matëse</Label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
              <option>copë</option>
              <option>pako</option>
              <option>kuti</option>
              <option>shishe</option>
              <option>kg</option>
              <option>g</option>
              <option>L</option>
              <option>ml</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Përshkrimi</Label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Çmimet</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Çmimi i blerjes</Label>
            <Input type="number" step="0.01" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Çmimi i shitjes</Label>
            <Input type="number" step="0.01" value={sellPrice} onChange={(e) => setSellPrice(Number(e.target.value))} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">TVSH %</Label>
            <Input type="number" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))} />
          </div>
          {sellPrice > 0 && buyPrice > 0 && (
            <div className="md:col-span-3 rounded-lg bg-muted/30 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Marzhi:</span>{" "}
              <span className={`font-mono font-semibold ${margin > 30 ? "text-success" : margin > 10 ? "text-warning" : "text-destructive"}`}>
                {margin.toFixed(1)}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Stoku</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Niveli minimal (alarm)</Label>
            <Input type="number" value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Depo fillestare</Label>
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm">
              <option value="">— Asnjë —</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Sasia fillestare</Label>
            <Input type="number" value={initialStock} onChange={(e) => setInitialStock(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anulo</Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…</> : <><Save className="h-4 w-4" /> Ruaj produktin</>}
        </Button>
      </div>
    </form>
  );
}
