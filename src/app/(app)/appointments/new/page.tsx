import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db-context";
import { AppointmentForm } from "../appointment-form";

export const metadata = { title: "Termin i ri" };
export const dynamic = "force-dynamic";

export default async function NewAppointmentPage() {
  const db = await getDb();
  const doctors = await db.user.findMany({
    where: { isActive: true, role: { in: ["DOCTOR", "SUPER_ADMIN", "ADMIN"] } },
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Termin i ri"
        description="Planifiko një takim me pacient duke zgjedhur mjekun dhe orarin"
        breadcrumb={[{ label: "Klinika" }, { label: "Terminet", href: "/appointments" }, { label: "I ri" }]}
      />
      <AppointmentForm doctors={doctors.map((d) => ({ id: d.id, name: `${d.firstName} ${d.lastName}` }))} />
    </div>
  );
}
