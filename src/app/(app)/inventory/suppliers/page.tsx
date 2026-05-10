import Link from "next/link";
import { Plus, Truck, Phone, Mail, Building } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Furnizuesit" };
export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const db = await getDb();
  const suppliers = await db.supplier.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <PageHeader
        title="Furnizuesit"
        description={`${suppliers.length} furnizues të regjistruar`}
        breadcrumb={[{ label: "Stoku", href: "/inventory" }, { label: "Furnizuesit" }]}
        actions={<Button variant="premium" size="sm" asChild><Link href="/inventory/suppliers/new"><Plus className="h-4 w-4" /> Furnizues i ri</Link></Button>}
      />

      {suppliers.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState icon={Truck} title="Asnjë furnizues" description="Shto kompani furnizuese për menaxhim më të mirë të blerjeve." />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <Card key={s.id} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  {!s.isActive && <Badge variant="muted">Joaktiv</Badge>}
                </div>
                <h3 className="font-semibold">{s.name}</h3>
                {s.contactName && <div className="text-xs text-muted-foreground mt-0.5">{s.contactName}</div>}
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {s.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {s.phone}</div>}
                  {s.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {s.email}</div>}
                  {s.taxId && <div>NUI: {s.taxId}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ variant, children }: { variant: string; children: React.ReactNode }) {
  return <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{children}</span>;
}
