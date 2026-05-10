import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ShieldCheck, Mail, Phone, Edit } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { formatRelative, initials } from "@/lib/utils";
import { getCurrentSession, hasPermission, ROLE_LABELS } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata = { title: "Përdoruesit" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const db = await getDb();
  const session = await getCurrentSession();
  if (!hasPermission(session?.role, "USERS_MANAGE")) redirect("/dashboard");

  const users = await db.user.findMany({
    orderBy: [{ isActive: "desc" }, { lastName: "asc" }],
    include: { department: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Përdoruesit"
        description="Stafi, rolet dhe lejet e qasjes"
        breadcrumb={[{ label: "Administrimi" }, { label: "Përdoruesit" }]}
        actions={
          <Button variant="premium" size="sm" asChild>
            <Link href="/users/new">
              <Plus className="h-4 w-4" /> Përdorues i ri
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Përdoruesi</th>
                  <th className="px-4 py-3">Roli</th>
                  <th className="px-4 py-3">Departamenti</th>
                  <th className="px-4 py-3">Kontakti</th>
                  <th className="px-4 py-3">Hyrja e fundit</th>
                  <th className="px-4 py-3">Statusi</th>
                  <th className="px-4 py-3 text-right">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{initials(u.firstName, u.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">
                        <ShieldCheck className="h-3 w-3" /> {ROLE_LABELS[u.role]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{u.department?.nameSq ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {u.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.lastLoginAt ? formatRelative(u.lastLoginAt) : "Asnjëherë"}
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <Badge variant="success">Aktiv</Badge>
                      ) : (
                        <Badge variant="destructive">Çaktivizuar</Badge>
                      )}
                      {u.twoFactorEnabled && (
                        <Badge variant="info" className="ml-1.5">2FA</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/users/${u.id}/edit` as never}>
                          <Edit className="h-4 w-4" /> Edito
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
