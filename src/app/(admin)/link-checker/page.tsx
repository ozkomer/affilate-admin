import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LinkChecker from "@/components/link-checker/LinkChecker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link Kontrolü | EnesOzen Affilate",
  description: "Hepsiburada linklerini kontrol et",
};

export default async function LinkCheckerPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Hepsiburada Link Kontrolü" />
      </div>
      <LinkChecker />
    </div>
  );
}

