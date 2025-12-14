import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ListTable } from "@/components/lists/ListTable";
import { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@/icons";
import Button from "@/components/ui/button/Button";

export const metadata: Metadata = {
  title: "Listeler | EnesOzen Affilate",
  description: "Liste yönetim sayfası",
};

export default function ListsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Listeler" />
        <Link href="/lists/new">
          <Button size="sm" className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Yeni Liste
          </Button>
        </Link>
      </div>
      <ListTable />
    </div>
  );
}
