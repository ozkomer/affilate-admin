import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ListForm from "@/components/lists/ListForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liste Düzenle | EnesOzen Affilate",
  description: "Liste düzenle",
};

export default function EditListPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <PageBreadcrumb pageTitle="Liste Düzenle" />
      <ListForm listId={params.id} />
    </div>
  );
}

