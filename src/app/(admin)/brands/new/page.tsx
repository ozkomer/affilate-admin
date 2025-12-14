import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BrandForm from "@/components/brands/BrandForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yeni Marka | EnesOzen Affilate",
  description: "Yeni e-ticaret markası oluştur",
};

export default function NewBrandPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Yeni Marka Oluştur" />
      <BrandForm />
    </div>
  );
}


