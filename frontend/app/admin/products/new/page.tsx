import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="New product" description="Add an item to the catalogue." />
      <ProductForm />
    </div>
  );
}
