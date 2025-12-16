import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CategoryForm from "@/components/categories/CategoryForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yeni Kategori | EnesOzen Affilate",
  description: "Yeni kategori oluştur",
};

export default function NewCategoryPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Yeni Kategori Oluştur" />
      <CategoryForm />
    </div>
  );
}



