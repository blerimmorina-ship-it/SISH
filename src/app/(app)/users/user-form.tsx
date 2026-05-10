"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import { evaluatePasswordStrength } from "@/lib/password-strength";
import { toast } from "sonner";

const ROLES: Role[] = [
  "SUPER_ADMIN", "ADMIN", "DOCTOR", "LAB_TECHNICIAN",
  "RECEPTIONIST", "ACCOUNTANT", "NURSE", "VIEWER",
];

export interface UserInitialValues {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: Role;
  departmentId: string | null;
  twoFactorEnabled: boolean;
  isActive: boolean;
}

export function UserForm({
  departments,
  initialUser,
}: {
  departments: { id: string; name: string }[];
  initialUser?: UserInitialValues;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(initialUser);

  const [firstName, setFirstName] = useState(initialUser?.firstName ?? "");
  const [lastName, setLastName] = useState(initialUser?.lastName ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [phone, setPhone] = useState(initialUser?.phone ?? "");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState<Role>(initialUser?.role ?? "DOCTOR");
  const [departmentId, setDepartmentId] = useState(initialUser?.departmentId ?? "");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialUser?.twoFactorEnabled ?? false);
  const [isActive, setIsActive] = useState(initialUser?.isActive ?? true);

  const strength = evaluatePasswordStrength(password);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Te edit, password është opsional. Te new, është i detyrueshëm.
    if (!isEdit && strength.issues.length > 0) {
      toast.error(`Fjalëkalimi: ${strength.issues.join(", ")}`);
      return;
    }
    if (isEdit && password && strength.issues.length > 0) {
      toast.error(`Fjalëkalimi: ${strength.issues.join(", ")}`);
      return;
    }
    startTransition(async () => {
      try {
        const url = isEdit ? `/api/users/${initialUser!.id}` : "/api/users";
        const method = isEdit ? "PATCH" : "POST";
        const body: Record<string, unknown> = {
          firstName,
          lastName,
          email,
          phone,
          role,
          departmentId: departmentId || null,
          twoFactorEnabled,
        };
        if (isEdit) body.isActive = isActive;
        if (!isEdit || password) body.password = password;
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? (isEdit ? "Përditësimi dështoi" : "Krijimi dështoi"));
          return;
        }
        toast.success(isEdit ? "Përdoruesi u përditësua" : "Përdoruesi u krijua");
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
            <Label className="mb-1.5 text-xs">
              {isEdit ? "Fjalëkalimi i ri (lëre bosh për ta mbajtur)" : "Fjalëkalimi *"}
            </Label>
            <Input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              minLength={isEdit && !password ? undefined : 8}
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
          {isEdit && (
            <label className="md:col-span-2 flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary"
              />
              Llogaria aktive (çakto vetëm për të çaktivizuar përdoruesin)
            </label>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anulo</Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…</>
          ) : (
            <><Save className="h-4 w-4" /> {isEdit ? "Ruaj ndryshimet" : "Krijo përdoruesin"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
