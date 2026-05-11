"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Status = "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED" | "CONVERTED";

function useQuoteAction(quoteId: string, status: Status, successMsg: string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  function go() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/quotes/${quoteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Veprimi dështoi");
          return;
        }
        toast.success(successMsg);
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }
  return { go, isPending };
}

export function QuoteSendButton({ quoteId }: { quoteId: string }) {
  const { go, isPending } = useQuoteAction(quoteId, "SENT", "Kuotimi u dërgua");
  return (
    <Button variant="info" size="sm" onClick={go} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      Dërgo
    </Button>
  );
}

export function QuoteApproveButton({ quoteId }: { quoteId: string }) {
  const { go, isPending } = useQuoteAction(quoteId, "APPROVED", "Kuotimi u aprovua");
  return (
    <Button variant="success" size="sm" onClick={go} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      Aprovo
    </Button>
  );
}

export function QuoteRejectButton({ quoteId }: { quoteId: string }) {
  const { go, isPending } = useQuoteAction(quoteId, "REJECTED", "Kuotimi u refuzua");
  return (
    <Button variant="destructive" size="sm" onClick={go} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
      Refuzo
    </Button>
  );
}
