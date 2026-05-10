"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, User, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { evaluatePasswordStrength } from "@/lib/password-strength";

export function SignupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Tenant
  const [tenantName, setTenantName] = useState("");
  const [tenantCode, setTenantCode] = useState("");
  const [city, setCity] = useState("");

  // Step 2: Admin
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const strength = evaluatePasswordStrength(password);

  function autoCode(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
    if (!tenantCode || tenantCode === autoCode.lastSeen) {
      setTenantCode(slug);
      autoCode.lastSeen = slug;
    }
  }
  autoCode.lastSeen = "";

  function nextStep(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantName || !tenantCode) return toast.error("Plotëso emrin dhe kodin");
    if (!/^[a-z0-9-]{3,30}$/.test(tenantCode)) {
      return toast.error("Kodi duhet 3-30 karaktere, vetëm a-z, 0-9, -");
    }
    setStep(2);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (strength.issues.length > 0) {
      return toast.error(`Fjalëkalimi: ${strength.issues.join(", ")}`);
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantName, tenantCode, city,
            firstName, lastName, email, password,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Regjistrimi dështoi");
          return;
        }
        toast.success("Klinika u krijua! Mirë se erdhe.");
        router.push("/dashboard");
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  const strengthColors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-info", "bg-success"];

  return (
    <form onSubmit={step === 1 ? nextStep : handleSubmit} className="space-y-4">
      {/* Step indicator */}
      <div className="flex gap-2 mb-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step >= s ? "bg-gradient-to-r from-primary to-accent" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-muted-foreground mb-4">
        Hapi {step}/2 — {step === 1 ? "Klinika" : "Administrator"}
      </div>

      {step === 1 && (
        <>
          <div className="space-y-2">
            <Label htmlFor="tenantName">Emri i klinikës *</Label>
            <Input
              id="tenantName"
              icon={<Building2 className="h-4 w-4" />}
              value={tenantName}
              onChange={(e) => {
                setTenantName(e.target.value);
                autoCode(e.target.value);
              }}
              required
              placeholder="P.sh. Klinika Mjekësore X"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantCode">Subdomain (URL) *</Label>
            <div className="relative">
              <Input
                id="tenantCode"
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                required
                placeholder="klinika-x"
                className="h-11 pr-32"
                maxLength={30}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                .sish.app
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {tenantCode ? (
                <>URL e klinikës: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{tenantCode}.sish.app</code></>
              ) : "Vetëm shkronja të vogla, numra dhe vizat"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Qyteti</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="P.sh. Prishtinë"
              className="h-11"
            />
          </div>

          <Button type="submit" variant="premium" size="lg" className="w-full">
            <Sparkles className="h-4 w-4" /> Vazhdo →
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="rounded-lg bg-muted/30 px-4 py-2.5 text-xs">
            <strong className="text-foreground">{tenantName}</strong>{" "}
            <span className="text-muted-foreground">· {tenantCode}.sish.app</span>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="ml-2 text-primary hover:underline"
            >
              Edito
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Emri *</Label>
              <Input
                id="firstName"
                icon={<User className="h-4 w-4" />}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Mbiemri *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Emaili *</Label>
            <Input
              id="email"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
              placeholder="ti@klinika.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Fjalëkalimi *</Label>
            <Input
              id="password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-11"
              placeholder="Min. 8 karaktere"
            />
            {password && (
              <>
                <div className="flex h-1.5 gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${i <= strength.score ? strengthColors[strength.score] : "bg-muted"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{strength.label}</span>
                  {strength.issues.length > 0 && (
                    <span className="text-destructive">{strength.issues[0]}</span>
                  )}
                </div>
              </>
            )}
          </div>

          <Button type="submit" variant="premium" size="lg" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Duke krijuar…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" /> Krijo klinikën
              </>
            )}
          </Button>
        </>
      )}
    </form>
  );
}
