"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type LabStatus = "REQUESTED" | "SAMPLE_TAKEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

const NEXT_LABEL: Record<LabStatus, string> = {
  REQUESTED: "Shëno mostrën e marrë",
  SAMPLE_TAKEN: "Fillo procesimin",
  IN_PROGRESS: "Përfundo urdhrin",
  COMPLETED: "I përfunduar",
  CANCELLED: "I anuluar",
};

export function LabOrderStatusActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(next: LabStatus) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/lab-orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Përditësimi dështoi");
          return;
        }
        toast.success(`Statusi u përditësua: ${NEXT_LABEL[next]}`);
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  // Tranzicione të lejuara nga statusi aktual
  return (
    <div className="space-y-2">
      <Button
        variant="info"
        size="sm"
        className="w-full"
        disabled={isPending || status !== "REQUESTED"}
        onClick={() => setStatus("SAMPLE_TAKEN")}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
        Shëno mostrën e marrë
      </Button>
      <Button
        variant="warning"
        size="sm"
        className="w-full"
        disabled={isPending || status !== "SAMPLE_TAKEN"}
        onClick={() => setStatus("IN_PROGRESS")}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
        Fillo procesimin
      </Button>
      <Button
        variant="success"
        size="sm"
        className="w-full"
        disabled={isPending || status !== "IN_PROGRESS"}
        onClick={() => setStatus("COMPLETED")}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        Përfundo urdhrin
      </Button>
    </div>
  );
}
