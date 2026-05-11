"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function OpenCashboxButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [openingFloat, setOpeningFloat] = useState(0);

  function submit() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/cashbox`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "open", openingFloat }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Hapja dështoi");
          return;
        }
        toast.success("Arka u hap");
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  return (
    <>
      <Button variant="premium" size="sm" onClick={() => setOpen(true)} disabled={isPending}>
        <Unlock className="h-4 w-4" /> Hap ditën
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-premium"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-1">Hap arkën</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Shëno shumën fillestare në kasë (float) për të nisur sesionin
            </p>
            <label className="text-xs text-muted-foreground">Float fillestar (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={openingFloat}
              onChange={(e) => setOpeningFloat(Number(e.target.value) || 0)}
              autoFocus
              className="mt-1 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
                Anulo
              </Button>
              <Button variant="premium" onClick={submit} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                Hap
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function CloseCashboxButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [closingCash, setClosingCash] = useState(0);

  function submit() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/cashbox`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "close", sessionId, closingCash }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Mbyllja dështoi");
          return;
        }
        toast.success(
          json.session?.variance === 0
            ? "Arka u mbyll pa diferenca"
            : `Arka u mbyll. Variance: ${Number(json.session?.variance ?? 0).toFixed(2)} €`,
        );
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={isPending}>
        <Lock className="h-4 w-4" /> Mbyll arkën
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-premium"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-1">Mbyll arkën</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Shëno cash-in real të numëruar në fund të ditës. Diferenca llogaritet automatikisht.
            </p>
            <label className="text-xs text-muted-foreground">Cash-i i numëruar (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={closingCash}
              onChange={(e) => setClosingCash(Number(e.target.value) || 0)}
              autoFocus
              className="mt-1 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
                Anulo
              </Button>
              <Button variant="destructive" onClick={submit} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Mbyll
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
