import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LinkForm from "@/components/links/LinkForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yeni Link | EnesOzen Affilate",
  description: "Yeni affiliate link oluştur",
};

export default function NewLinkPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Yeni Link Oluştur" />
      <LinkForm />
    </div>
  );
}


