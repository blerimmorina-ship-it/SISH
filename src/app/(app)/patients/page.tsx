import Link from "next/link";
import { Plus, Filter, Download, Users, Phone, Calendar, Mail } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { calculateAge, formatDate, genderLabel, bloodTypeLabel } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { PatientSearch } from "./patient-search";

export const metadata = { title: "Pacientët" };
export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  gender?: string;
  page?: string;
}

const PAGE_SIZE = 20;

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const db = await getDb();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const q = params.q?.trim() ?? "";

  const where = {
    isActive: true,
    ...(q && {
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { phone: { contains: q } },
        { personalId: { contains: q } },
        { code: { contains: q } },
      ],
    }),
    ...(params.gender && { gender: params.gender as "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED" }),
  };

  const [patients, totalCount] = await Promise.all([
    db.patient.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { visits: true, labOrders: true, invoices: true } },
      },
    }),
    db.patient.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientët"
        description={`${totalCount.toLocaleString("sq-AL")} pacientë në regjistër`}
        breadcrumb={[{ label: "Klinika" }, { label: "Pacientët" }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Filtro
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Eksporto
            </Button>
            <Button variant="premium" size="sm" asChild>
              <Link href="/patients/new">
                <Plus className="h-4 w-4" /> Pacient i ri
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <PatientSearch initialQuery={q} />
        </CardContent>
      </Card>

      {patients.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Users}
              title={q ? "Asnjë rezultat" : "Asnjë pacient akoma"}
              description={
                q
                  ? "Provo me një kërkim tjetër ose pastro filtrat."
                  : "Fillo duke regjistruar pacientin tuaj të parë."
              }
              action={
                <Button asChild variant="premium" size="sm">
                  <Link href="/patients/new">
                    <Plus className="h-4 w-4" /> Shto pacient
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Pacienti</th>
                    <th className="px-4 py-3">Kontakti</th>
                    <th className="px-4 py-3">Mosha / Gjinia</th>
                    <th className="px-4 py-3">Grup. gjakut</th>
                    <th className="px-4 py-3">Vizita</th>
                    <th className="px-4 py-3">Regjistruar</th>
                    <th className="px-4 py-3 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/40 last:border-b-0 hover:bg-accent/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/patients/${p.id}`} className="flex items-center gap-3 group">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{initials(p.firstName, p.lastName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium group-hover:text-primary transition-colors">
                              {p.firstName} {p.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">{p.code}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {p.phone && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground" /> {p.phone}
                          </div>
                        )}
                        {p.email && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-[220px]">
                            <Mail className="h-3 w-3 shrink-0" /> <span className="truncate">{p.email}</span>
                          </div>
                        )}
                        {!p.phone && !p.email && <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {p.dateOfBirth ? `${calculateAge(p.dateOfBirth)} vjeç` : "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">{genderLabel(p.gender)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{bloodTypeLabel(p.bloodType)}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{p._count.visits}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {formatDate(p.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/patients/${p.id}`}>Shih →</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
                <span>
                  Faqja {page} nga {totalPages}
                </span>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/patients?page=${page - 1}${q ? `&q=${q}` : ""}`}>← E mëparshme</Link>
                    </Button>
                  )}
                  {page < totalPages && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/patients?page=${page + 1}${q ? `&q=${q}` : ""}`}>E ardhshme →</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
