import { redirect } from "next/navigation";
import { Mail, Phone, ShieldCheck, Calendar, Building2 } from "lucide-react";
import { getCurrentUser, ROLE_LABELS } from "@/lib/auth";
import { formatDateTime, initials } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Profili" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader title="Profili im" description="Detajet e llogarisë dhe sigurisë" />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarFallback className="text-3xl">
                {initials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">
                  <ShieldCheck className="h-3 w-3" /> {ROLE_LABELS[user.role]}
                </Badge>
                {user.department && (
                  <Badge variant="secondary">
                    <Building2 className="h-3 w-3" /> {user.department.nameSq}
                  </Badge>
                )}
                {user.twoFactorEnabled && <Badge variant="success">2FA aktiv</Badge>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm pt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" /> {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" /> {user.phone}
                  </div>
                )}
                {user.lastLoginAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> Hyrja e fundit: {formatDateTime(user.lastLoginAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Siguria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Autentifikim 2-faktorësh" value={user.twoFactorEnabled ? "Aktiv" : "Çaktivizuar"} />
            <Row label="Përpjekje të dështuara" value={String(user.failedAttempts)} />
            <Row
              label="Email i verifikuar"
              value={user.emailVerified ? formatDateTime(user.emailVerified) : "Jo"}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Llogaria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="ID e llogarisë" value={user.id.slice(-12)} mono />
            <Row label="Krijuar më" value={formatDateTime(user.createdAt)} />
            <Row label="Përditësuar më" value={formatDateTime(user.updatedAt)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : "font-medium"}>{value}</span>
    </div>
  );
}
