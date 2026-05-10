"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PatientSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQuery);
  const [, startTransition] = useTransition();

  function update(value: string) {
    const sp = new URLSearchParams(params);
    if (value) sp.set("q", value);
    else sp.delete("q");
    sp.delete("page");
    startTransition(() => {
      router.push(`/patients?${sp.toString()}` as never);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        update(q);
      }}
      className="flex items-center gap-2"
    >
      <Input
        icon={<Search className="h-4 w-4" />}
        iconRight={
          q ? (
            <button
              type="button"
              onClick={() => {
                setQ("");
                update("");
              }}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Pastro"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null
        }
        placeholder="Kërko sipas emrit, kodit, telefonit ose ID personale…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="h-10"
      />
      <Button type="submit" variant="default" size="default">
        Kërko
      </Button>
    </form>
  );
}
