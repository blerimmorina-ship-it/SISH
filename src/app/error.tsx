"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center aurora p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertOctagon className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Diçka shkoi keq</h1>
        <p className="text-muted-foreground">
          Sistemi hasi në një gabim të papritur. Ekipi ynë është njoftuar automatikisht.
        </p>
        {error.digest && (
          <code className="block text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-2 rounded-lg">
            ID: {error.digest}
          </code>
        )}
        <Button variant="premium" size="sm" onClick={reset}>
          <RefreshCw className="h-4 w-4" /> Provo përsëri
        </Button>
      </div>
    </div>
  );
}
