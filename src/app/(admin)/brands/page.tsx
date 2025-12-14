import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BrandTable from "@/components/brands/BrandTable";
import { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@/icons";
import Button from "@/components/ui/button/Button";

export const metadata: Metadata = {
  title: "E-ticaret Markaları | EnesOzen Affilate",
  description: "E-ticaret marka yönetim sayfası",
};

export default async function BrandsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="E-ticaret Markaları" />
        <Link href="/brands/new">
          <Button size="sm" className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Yeni Marka
          </Button>
        </Link>
      </div>
      <BrandTable />
    </div>
  );
}


