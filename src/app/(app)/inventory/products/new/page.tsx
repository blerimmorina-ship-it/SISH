import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/lib/db-context";
import { ProductForm } from "../../product-form";

export const metadata = { title: "Produkt i ri" };

export default async function NewProductPage() {
  const db = await getDb();
  const [categories, warehouses] = await Promise.all([
    db.productCategory.findMany({ orderBy: { name: "asc" } }),
    db.warehouse.findMany({ where: { isActive: true } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produkt i ri"
        description="Shto barna, reagjentë ose materiale harxhuese"
        breadcrumb={[
          { label: "Stoku", href: "/inventory" },
          { label: "Produktet", href: "/inventory/products" },
          { label: "I ri" },
        ]}
      />
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        warehouses={warehouses.map((w) => ({ id: w.id, name: w.name }))}
      />
    </div>
  );
}
