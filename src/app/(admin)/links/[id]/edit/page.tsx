import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LinkForm from "@/components/links/LinkForm";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Link Düzenle | EnesOzen Affilate",
  description: "Affiliate link düzenle",
};

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <PageBreadcrumb pageTitle="Link Düzenle" />
      <LinkForm linkId={id} />
    </div>
  );
}


