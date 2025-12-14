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
import { CopyIcon, PencilIcon, TrashBinIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Button from "../ui/button/Button";

interface AffiliateLink {
  id: string;
  title: string;
  description: string | null;
  originalUrl: string;
  shortUrl: string;
  isActive: boolean;
  clickCount: number;
  category: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  ecommerceBrand: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    logo: string | null;
  } | null;
  createdAt: string;
}

export default function LinkTable() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links");
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu linki silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchLinks();
      }
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Henüz link eklenmemiş.
        </p>
        <Link href="/links/new">
          <Button size="sm">İlk Linkini Oluştur</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Başlık
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Orijinal URL
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Kısa URL
                </TableCell>
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
                  Kategori
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Tıklama
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
              {links.map((link) => {
                const shortUrlFull = typeof window !== 'undefined' ? `${window.location.origin}/l/${link.shortUrl}` : `/l/${link.shortUrl}`;
                return (
                  <TableRow key={link.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {link.title}
                        </span>
                        {link.description && (
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400 mt-1">
                            {link.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-500 hover:text-brand-600 text-theme-sm dark:text-brand-400 truncate max-w-xs block"
                      >
                        {link.originalUrl}
                      </a>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <a
                          href={shortUrlFull}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-500 hover:text-brand-600 text-theme-sm dark:text-brand-400"
                        >
                          /l/{link.shortUrl}
                        </a>
                        <button
                          onClick={() => copyToClipboard(shortUrlFull)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          title="Kopyala"
                        >
                          <CopyIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      {link.ecommerceBrand ? (
                        <div className="flex items-center gap-2">
                          {link.ecommerceBrand.logo && (
                            <img
                              src={link.ecommerceBrand.logo}
                              alt={link.ecommerceBrand.name}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <Badge
                            size="sm"
                            color="success"
                            style={{
                              backgroundColor: link.ecommerceBrand.color || undefined,
                              color: 'white',
                            }}
                          >
                            {link.ecommerceBrand.name}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-theme-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      {link.category ? (
                        <Badge
                          size="sm"
                          color="success"
                          style={{
                            backgroundColor: link.category.color || undefined,
                            color: 'white',
                          }}
                        >
                          {link.category.name}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-theme-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {link.clickCount}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={link.isActive ? "success" : "error"}
                      >
                        {link.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/links/${link.id}/edit`}>
                          <button
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            title="Düzenle"
                          >
                            <PencilIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          title="Sil"
                        >
                          <TrashBinIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

