import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ListForm from "@/components/lists/ListForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liste Düzenle | EnesOzen Affilate",
  description: "Liste düzenle",
};

export default async function EditListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Liste Düzenle" />
      <ListForm listId={id} />
    </div>
  );
}

