"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CustomLinkForm from "@/components/custom-links/CustomLinkForm";

export default function NewCustomLinkPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Yeni Özel Link" />
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <CustomLinkForm />
      </div>
    </div>
  );
}

