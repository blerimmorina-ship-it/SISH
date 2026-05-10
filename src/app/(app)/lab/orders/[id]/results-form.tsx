"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Result {
  id: string;
  parameterId: string;
  name: string;
  unit: string | null;
  refMin: number | null;
  refMax: number | null;
  refText: string | null;
  value: string;
  flag: string;
}

interface Group {
  templateName: string;
  results: Result[];
}

export function ResultsForm({ orderId, groupedResults }: { orderId: string; groupedResults: Group[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(groupedResults.flatMap((g) => g.results.map((r) => [r.id, r.value]))),
  );

  function flagFor(result: Result, value: string): "PENDING" | "NORMAL" | "ABNORMAL" | "CRITICAL" {
    if (!value) return "PENDING";
    const n = Number(value);
    if (isNaN(n)) return "NORMAL";
    if (result.refMin !== null && result.refMax !== null) {
      if (n < result.refMin * 0.5 || n > result.refMax * 1.5) return "CRITICAL";
      if (n < result.refMin || n > result.refMax) return "ABNORMAL";
      return "NORMAL";
    }
    return "NORMAL";
  }

  function handleSave() {
    const updates = Object.entries(values).map(([id, value]) => {
      const result = groupedResults.flatMap((g) => g.results).find((r) => r.id === id)!;
      return { id, value, flag: flagFor(result, value) };
    });

    startTransition(async () => {
      try {
        const res = await fetch(`/api/lab-orders/${orderId}/results`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        });
        if (!res.ok) {
          const json = await res.json();
          toast.error(json.error ?? "Ruajtja dështoi");
          return;
        }
        toast.success("Rezultatet u ruajtën");
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <FlaskConical className="h-4 w-4 text-primary" /> Rezultatet
        </CardTitle>
        <Button onClick={handleSave} disabled={isPending} variant="premium" size="sm">
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…</> : <><Save className="h-4 w-4" /> Ruaj rezultatet</>}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedResults.map((group) => (
          <div key={group.templateName}>
            <h3 className="mb-3 font-semibold">{group.templateName}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 text-left">Parametri</th>
                    <th className="px-3 py-2 text-left">Vlera</th>
                    <th className="px-3 py-2 text-left">Njësia</th>
                    <th className="px-3 py-2 text-left">Diapazoni</th>
                    <th className="px-3 py-2 text-left">Statusi</th>
                  </tr>
                </thead>
                <tbody>
                  {group.results.map((r) => {
                    const v = values[r.id] ?? "";
                    const flag = flagFor(r, v);
                    return (
                      <tr key={r.id} className="border-b border-border/30 last:border-b-0">
                        <td className="px-3 py-2 font-medium">{r.name}</td>
                        <td className="px-3 py-2">
                          <Input
                            value={v}
                            onChange={(e) => setValues((p) => ({ ...p, [r.id]: e.target.value }))}
                            className="h-8 w-32"
                            placeholder={r.refMin !== null ? `${r.refMin}–${r.refMax}` : ""}
                          />
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{r.unit ?? "—"}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {r.refMin !== null && r.refMax !== null
                            ? `${r.refMin} – ${r.refMax}`
                            : r.refText ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={
                              flag === "CRITICAL" ? "destructive" : flag === "ABNORMAL" ? "warning" : flag === "NORMAL" ? "success" : "secondary"
                            }
                          >
                            {flag}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
