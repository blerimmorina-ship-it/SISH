import { Plus, Tags } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Kategoritë e produkteve" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const db = await getDb();
  const categories = await db.productCategory.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: { children: { include: { products: true } }, products: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategoritë"
        description="Klasifikim hierarkik i produkteve dhe artikujve"
        breadcrumb={[{ label: "Stoku", href: "/inventory" }, { label: "Kategoritë" }]}
        actions={<Button variant="premium" size="sm"><Plus className="h-4 w-4" /> Kategori e re</Button>}
      />

      {categories.length === 0 ? (
        <Card><CardContent className="p-12"><EmptyState icon={Tags} title="Asnjë kategori" /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="font-semibold">{c.name}</div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">{c.products.length} produkte</Badge>
                  <Badge variant="secondary">{c.children.length} nën-kategori</Badge>
                </div>
                {c.children.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {c.children.map((ch) => (
                      <li key={ch.id} className="flex items-center justify-between">
                        <span>↳ {ch.name}</span>
                        <span>{ch.products.length}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
