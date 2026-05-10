import { PageHeader } from "@/components/ui/page-header";
import { PatientForm } from "../patient-form";

export const metadata = { title: "Pacient i ri" };

export default function NewPatientPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacient i ri"
        description="Plotëso të dhënat bazike. Mund t'i shtosh të tjera më vonë."
        breadcrumb={[
          { label: "Klinika" },
          { label: "Pacientët", href: "/patients" },
          { label: "I ri" },
        ]}
      />
      <PatientForm />
    </div>
  );
}
