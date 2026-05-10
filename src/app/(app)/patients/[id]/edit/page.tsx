import { notFound } from "next/navigation";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { PatientForm } from "../../patient-form";

export const metadata = { title: "Edito pacientin" };
export const dynamic = "force-dynamic";

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  const patient = await db.patient.findUnique({ where: { id } });
  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edito ${patient.firstName} ${patient.lastName}`}
        description="Përditëso të dhënat e pacientit"
        breadcrumb={[
          { label: "Klinika" },
          { label: "Pacientët", href: "/patients" },
          { label: `${patient.firstName} ${patient.lastName}`, href: `/patients/${patient.id}` },
          { label: "Edito" },
        ]}
      />
      <PatientForm
        defaultValues={{
          firstName: patient.firstName,
          lastName: patient.lastName,
          parentName: patient.parentName ?? "",
          personalId: patient.personalId ?? "",
          dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString().slice(0, 10) : "",
          gender: patient.gender as never,
          bloodType: patient.bloodType as never,
          phone: patient.phone ?? "",
          email: patient.email ?? "",
          address: patient.address ?? "",
          city: patient.city ?? "",
          occupation: patient.occupation ?? "",
          emergencyName: patient.emergencyName ?? "",
          emergencyPhone: patient.emergencyPhone ?? "",
          insuranceProvider: patient.insuranceProvider ?? "",
          insuranceNumber: patient.insuranceNumber ?? "",
          allergies: patient.allergies ?? "",
          chronicDiseases: patient.chronicDiseases ?? "",
          notes: patient.notes ?? "",
        }}
      />
    </div>
  );
}
