"use client";

import React from "react";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CustomLinkForm from "@/components/custom-links/CustomLinkForm";

export default function EditCustomLinkPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <PageBreadcrumb pageTitle="Özel Link Düzenle" />
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <CustomLinkForm linkId={id} />
      </div>
    </div>
  );
}

