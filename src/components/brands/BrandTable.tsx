"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashBinIcon } from "@/icons";
import Link from "next/link";
import Button from "../ui/button/Button";
import Image from "next/image";

interface EcommerceBrand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  color: string | null;
  website: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    links: number;
  };
}

export default function BrandTable() {
  const [brands, setBrands] = useState<EcommerceBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu markayı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchBrands();
      } else {
        const error = await response.json();
        alert(error.error || "Marka silinirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      alert("Marka silinirken bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Henüz marka eklenmemiş.
        </p>
        <Link href="/brands/new">
          <Button size="sm">İlk Markayı Oluştur</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Marka
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Slug
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Website
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Link Sayısı
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Durum
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  İşlemler
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      {brand.logo && (
                        <div className="w-10 h-10 overflow-hidden rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {brand.name}
                        </span>
                        {brand.description && (
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400 mt-1">
                            {brand.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <code className="text-gray-500 text-theme-sm dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {brand.slug}
                    </code>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-500 hover:text-brand-600 text-theme-sm dark:text-brand-400"
                      >
                        {brand.website}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-theme-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {brand._count?.links || 0}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Badge
                      size="sm"
                      color={brand.isActive ? "success" : "error"}
                    >
                      {brand.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/brands/${brand.id}/edit`}>
                        <button
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          title="Düzenle"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        title="Sil"
                      >
                        <TrashBinIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}



