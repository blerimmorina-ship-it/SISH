"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ApptStatus = "SCHEDULED" | "CONFIRMED" | "ARRIVED" | "IN_VISIT" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export function ApptConfirmButton({ apptId }: { apptId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/appointments/${apptId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CONFIRMED" as ApptStatus }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Konfirmimi dështoi");
          return;
        }
        toast.success("Termini u konfirmua");
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  return (
    <Button variant="info" size="sm" onClick={confirm} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      Konfirmo
    </Button>
  );
}

export function ApptCancelButton({ apptId }: { apptId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function cancel() {
    if (!confirm("Të anulohet ky termin?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/appointments/${apptId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CANCELLED" as ApptStatus }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Anulimi dështoi");
          return;
        }
        toast.success("Termini u anulua");
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  return (
    <Button variant="destructive" size="sm" onClick={cancel} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
      Anulo
    </Button>
  );
}
