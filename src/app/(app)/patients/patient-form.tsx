"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Briefcase,
  AlertCircle,
  Save,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const patientSchema = z.object({
  firstName: z.string().min(1, "Emri është i kërkuar").max(80),
  lastName: z.string().min(1, "Mbiemri është i kërkuar").max(80),
  parentName: z.string().max(80).optional().or(z.literal("")),
  personalId: z.string().max(20).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNSPECIFIED"]).default("UNSPECIFIED"),
  bloodType: z
    .enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG", "UNKNOWN"])
    .default("UNKNOWN"),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Email i pasaktë").optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  occupation: z.string().max(80).optional().or(z.literal("")),
  emergencyName: z.string().max(80).optional().or(z.literal("")),
  emergencyPhone: z.string().max(20).optional().or(z.literal("")),
  insuranceProvider: z.string().max(80).optional().or(z.literal("")),
  insuranceNumber: z.string().max(40).optional().or(z.literal("")),
  allergies: z.string().max(500).optional().or(z.literal("")),
  chronicDiseases: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

type FormData = z.infer<typeof patientSchema>;

export function PatientForm({ defaultValues }: { defaultValues?: Partial<FormData> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "UNSPECIFIED",
      bloodType: "UNKNOWN",
      ...defaultValues,
    },
  });

  function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Ruajtja dështoi");
          return;
        }
        toast.success("Pacienti u ruajt");
        router.push(`/patients/${json.patient.id}` as never);
        router.refresh();
      } catch {
        toast.error("Diçka shkoi keq");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Identiteti
          </CardTitle>
          <CardDescription>Informacioni bazë i pacientit</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Emri *" error={errors.firstName?.message}>
            <Input {...register("firstName")} placeholder="P.sh. Albini" />
          </Field>
          <Field label="Mbiemri *" error={errors.lastName?.message}>
            <Input {...register("lastName")} placeholder="P.sh. Krasniqi" />
          </Field>
          <Field label="Emri i prindit">
            <Input {...register("parentName")} placeholder="Opsionale" />
          </Field>
          <Field label="ID personale" error={errors.personalId?.message}>
            <Input {...register("personalId")} placeholder="Numri i ID-së" />
          </Field>
          <Field label="Datëlindja" icon={<Calendar className="h-4 w-4" />}>
            <Input type="date" {...register("dateOfBirth")} />
          </Field>
          <Field label="Gjinia">
            <select
              {...register("gender")}
              className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
            >
              <option value="UNSPECIFIED">— Përzgjidh —</option>
              <option value="MALE">Mashkull</option>
              <option value="FEMALE">Femër</option>
              <option value="OTHER">Tjetër</option>
            </select>
          </Field>
          <Field label="Grupi i gjakut">
            <select
              {...register("bloodType")}
              className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
            >
              <option value="UNKNOWN">— I panjohur —</option>
              <option value="A_POS">A+</option>
              <option value="A_NEG">A−</option>
              <option value="B_POS">B+</option>
              <option value="B_NEG">B−</option>
              <option value="AB_POS">AB+</option>
              <option value="AB_NEG">AB−</option>
              <option value="O_POS">O+</option>
              <option value="O_NEG">O−</option>
            </select>
          </Field>
          <Field label="Profesioni" icon={<Briefcase className="h-4 w-4" />}>
            <Input {...register("occupation")} placeholder="P.sh. Mësues" />
          </Field>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" /> Kontakti
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Telefoni" icon={<Phone className="h-4 w-4" />}>
            <Input {...register("phone")} placeholder="+383 44 ..." />
          </Field>
          <Field label="Emaili" icon={<Mail className="h-4 w-4" />} error={errors.email?.message}>
            <Input type="email" {...register("email")} placeholder="emaili@shembull.com" />
          </Field>
          <Field label="Adresa" icon={<MapPin className="h-4 w-4" />} className="md:col-span-2">
            <Input {...register("address")} placeholder="Rruga, numri" />
          </Field>
          <Field label="Qyteti">
            <Input {...register("city")} placeholder="P.sh. Prishtinë" />
          </Field>
        </CardContent>
      </Card>

      {/* Medical */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" /> Informacioni mjekësor
          </CardTitle>
          <CardDescription>Alergjitë, sëmundjet kronike dhe shënime klinike</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Alergjitë" icon={<AlertCircle className="h-4 w-4" />}>
            <textarea
              {...register("allergies")}
              rows={2}
              className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
              placeholder="P.sh. Penicilinë, arrë"
            />
          </Field>
          <Field label="Sëmundje kronike">
            <textarea
              {...register("chronicDiseases")}
              rows={2}
              className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
              placeholder="P.sh. Hipertension, diabet"
            />
          </Field>
        </CardContent>
      </Card>

      {/* Emergency & Insurance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" /> Kontakt urgjence & Sigurim
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Personi i kontaktit">
            <Input {...register("emergencyName")} placeholder="Emri i plotë" />
          </Field>
          <Field label="Telefoni i kontaktit">
            <Input {...register("emergencyPhone")} placeholder="+383 ..." />
          </Field>
          <Field label="Siguruesi">
            <Input {...register("insuranceProvider")} placeholder="P.sh. KOSCO" />
          </Field>
          <Field label="Numri i policës">
            <Input {...register("insuranceNumber")} placeholder="Numri i policës" />
          </Field>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Shënime</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/40"
            placeholder="Shënime opsionale për pacientin…"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Anulo
        </Button>
        <Button type="submit" variant="premium" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Duke ruajtur…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Ruaj pacientin
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className,
  icon,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 flex items-center gap-1.5 text-xs">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
