import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ListForm from "@/components/lists/ListForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yeni Liste | EnesOzen Affilate",
  description: "Yeni liste oluştur",
};

export default function NewListPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Yeni Liste Oluştur" />
      <ListForm />
    </div>
  );
}


