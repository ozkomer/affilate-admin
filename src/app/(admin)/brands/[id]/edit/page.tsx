import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BrandForm from "@/components/brands/BrandForm";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Marka Düzenle | EnesOzen Affilate",
  description: "E-ticaret markası düzenle",
};

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Marka Düzenle" />
      <BrandForm brandId={id} />
    </div>
  );
}


