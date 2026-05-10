"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, remember }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Kyçja dështoi");
          return;
        }
        toast.success("Mirë se erdhe!");
        router.push(redirectTo as never);
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq. Provo përsëri.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Emaili</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          placeholder="ti@klinika.com"
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Fjalëkalimi</Label>
          <a href="#" className="text-xs font-medium text-primary hover:underline">
            Harruat fjalëkalimin?
          </a>
        </div>
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="h-4 w-4" />}
          iconRight={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Fshih fjalëkalimin" : "Shfaq fjalëkalimin"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          placeholder="••••••••"
          className="h-11"
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary/40"
        />
        <span className="text-muted-foreground">Më mbaj të kyçur në këtë pajisje</span>
      </label>

      <Button type="submit" variant="premium" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Duke u kyçur…
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" /> Kyçu sigurt
          </>
        )}
      </Button>

      <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Demo:</strong> admin@klinika-demo.sish.local · <code>1111111111</code>
      </div>
    </form>
  );
}
