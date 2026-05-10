"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import { evaluatePasswordStrength } from "@/lib/password";
import { toast } from "sonner";

const ROLES: Role[] = [
  "SUPER_ADMIN", "ADMIN", "DOCTOR", "LAB_TECHNICIAN",
  "RECEPTIONIST", "ACCOUNTANT", "NURSE", "VIEWER",
];

export function UserForm({ departments }: { departments: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState<Role>("DOCTOR");
  const [departmentId, setDepartmentId] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const strength = evaluatePasswordStrength(password);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (strength.issues.length > 0) {
      toast.error(`Fjalëkalimi: ${strength.issues.join(", ")}`);
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName, lastName, email, phone, password, role,
            departmentId: departmentId || null,
            twoFactorEnabled,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Krijimi dështoi");
          return;
        }
        toast.success("Përdoruesi u krijua");
        router.push("/users");
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  const strengthColors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-info", "bg-success"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" /> Identiteti
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Emri *</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Mbiemri *</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Emaili *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Telefoni</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" /> Roli & Siguria
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 text-xs">Roli *</Label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40">
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs">Departamenti</Label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm focus:ring-2 focus:ring-primary/40">
              <option value="">— Asnjë —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1.5 text-xs">Fjalëkalimi *</Label>
            <Input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              iconRight={
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {password && (
              <div className="mt-2">
                <div className="flex h-1.5 gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${i <= strength.score ? strengthColors[strength.score] : "bg-muted"}`}
                    />
                  ))}
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{strength.label}</span>
                  {strength.issues.length > 0 && (
                    <span className="text-destructive">{strength.issues[0]}</span>
                  )}
                </div>
              </div>
            )}
          </div>
          <label className="md:col-span-2 flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary"
            />
            <ShieldCheck className="h-4 w-4 text-success" />
            Aktivizo autentifikim me 2 faktorë (rekomandohet)
          </label>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anulo</Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Duke krijuar…</> : <><Save className="h-4 w-4" /> Krijo përdoruesin</>}
        </Button>
      </div>
    </form>
  );
}
