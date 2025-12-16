import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CategoryTable from "@/components/categories/CategoryTable";
import { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@/icons";
import Button from "@/components/ui/button/Button";

export const metadata: Metadata = {
  title: "Kategoriler | EnesOzen Affilate",
  description: "Kategori yönetim sayfası",
};

export default async function CategoriesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Kategoriler" />
        <Link href="/categories/new">
          <Button size="sm" className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Yeni Kategori
          </Button>
        </Link>
      </div>
      <CategoryTable />
    </div>
  );
}



