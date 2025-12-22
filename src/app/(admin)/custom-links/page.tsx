"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CustomLinkTable from "@/components/custom-links/CustomLinkTable";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { PlusIcon } from "@/icons";

export default function CustomLinksPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Özel Linkler" />
        <Link href="/custom-links/new">
          <Button size="sm" className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Yeni Link Ekle
          </Button>
        </Link>
      </div>

      <CustomLinkTable />
    </div>
  );
}

