import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { getDb } from "@/lib/db-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Shabllonet e Analizave" };
export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const db = await getDb();
  const templates = await db.labTestTemplate.findMany({
    include: {
      service: { include: { department: true } },
      parameters: true,
    },
    orderBy: { category: "asc" },
  });

  const grouped = templates.reduce<Record<string, typeof templates>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shabllonet e Analizave"
        description="Shabllone të parametrave për çdo analizë"
        breadcrumb={[{ label: "Laboratori" }, { label: "Shabllonet" }]}
        actions={
          <Button variant="premium" size="sm">
            <Plus className="h-4 w-4" /> Shabllon i ri
          </Button>
        }
      />

      {templates.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={FileText}
              title="Asnjë shabllon akoma"
              description="Krijo shabllonet për t'i përdorur shpejt nëpër urdhra."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </h2>
                <Badge variant="outline">{items.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((t) => (
                  <Card key={t.id} className="card-hover">
                    <CardContent className="p-4">
                      <div className="font-medium">{t.service.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t.service.department?.nameSq ?? "—"} · {t.parameters.length} parametra
                      </div>
                      {t.sampleType && (
                        <Badge variant="secondary" className="mt-3">
                          Mostër: {t.sampleType}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
