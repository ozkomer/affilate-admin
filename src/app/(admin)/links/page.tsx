import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LinkTable from "@/components/links/LinkTable";
import { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@/icons";
import Button from "@/components/ui/button/Button";

export const metadata: Metadata = {
  title: "Linklerim | EnesOzen Affilate",
  description: "Affiliate link yönetim sayfası",
};

export default async function LinksPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Linklerim" />
        <Link href="/links/new">
          <Button size="sm" className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Yeni Link
          </Button>
        </Link>
      </div>
      <LinkTable />
    </div>
  );
}


