"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

interface VisitForStatus {
  id: string;
  status: string;
  patientId: string;
  departmentId: string;
  doctorId: string | null;
  scheduledAt: string;
  reason: string | null;
  diagnosis: string | null;
  symptoms: string | null;
  notes: string | null;
  serviceIds: string[];
}

export function VisitStatusActions({ visit }: { visit: VisitForStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(status: Status) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/visits/${visit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: visit.patientId,
            departmentId: visit.departmentId,
            doctorId: visit.doctorId,
            scheduledAt: visit.scheduledAt,
            reason: visit.reason ?? "",
            diagnosis: visit.diagnosis ?? "",
            symptoms: visit.symptoms ?? "",
            notes: visit.notes ?? "",
            serviceIds: visit.serviceIds,
            status,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Përditësimi dështoi");
          return;
        }
        toast.success(
          status === "IN_PROGRESS"
            ? "Vizita filloi"
            : status === "COMPLETED"
              ? "Vizita u përfundua"
              : "Statusi u përditësua",
        );
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  if (visit.status === "PENDING") {
    return (
      <Button
        variant="premium"
        size="sm"
        onClick={() => setStatus("IN_PROGRESS")}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
        Fillo
      </Button>
    );
  }

  if (visit.status === "IN_PROGRESS") {
    return (
      <Button
        variant="success"
        size="sm"
        onClick={() => setStatus("COMPLETED")}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        Përfundo
      </Button>
    );
  }

  return null;
}
