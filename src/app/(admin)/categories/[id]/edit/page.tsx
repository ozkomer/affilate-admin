import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CategoryForm from "@/components/categories/CategoryForm";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Kategori Düzenle | EnesOzen Affilate",
  description: "Kategori düzenle",
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Kategori Düzenle" />
      <CategoryForm categoryId={id} />
    </div>
  );
}


