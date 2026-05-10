"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export function PaymentForm({ invoiceId, maxAmount }: { invoiceId: string; maxAmount: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(maxAmount);
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount <= 0 || amount > maxAmount) {
      toast.error(`Shuma duhet të jetë midis 0.01 dhe ${formatCurrency(maxAmount)}`);
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, method, reference }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Pagesa dështoi");
          return;
        }
        toast.success("Pagesa u regjistrua");
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <div>
        <Label className="mb-1.5 text-xs">Shuma (max {formatCurrency(maxAmount)})</Label>
        <Input
          type="number"
          step="0.01"
          min={0.01}
          max={maxAmount}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <Label className="mb-1.5 text-xs">Metoda</Label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40"
        >
          <option value="CASH">Kesh</option>
          <option value="CARD">Kartë</option>
          <option value="BANK_TRANSFER">Bankë</option>
          <option value="INSURANCE">Sigurim</option>
          <option value="MIXED">I përzier</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <Label className="mb-1.5 text-xs">Reference (opsionale)</Label>
        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Nr. transaksioni, çek, etj."
        />
      </div>
      <Button type="submit" variant="premium" disabled={isPending}>
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Duke regjistruar…</>
        ) : (
          <><CreditCard className="h-4 w-4" /> Regjistro pagesën</>
        )}
      </Button>
    </form>
  );
}
