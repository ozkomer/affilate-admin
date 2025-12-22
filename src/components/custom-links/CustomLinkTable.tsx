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
import { CopyIcon, PencilIcon, TrashBinIcon } from "@/icons";
import Link from "next/link";
import Button from "../ui/button/Button";
import Pagination from "../tables/Pagination";

interface CustomLink {
  id: string;
  title: string;
  targetUrl: string;
  shortUrl: string;
  description: string | null;
  isActive: boolean;
  clickCount: number;
  tags: string[];
  notes: string | null;
  createdAt: string;
}

export default function CustomLinkTable() {
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const baseUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_BASE_URL || 'https://eneso.cc')
    : 'https://eneso.cc';

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/custom-links");
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error("Error fetching custom links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu linki silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/custom-links/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchLinks();
      } else {
        alert("Link silinirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      alert("Link silinirken bir hata oluştu");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Kopyalandı!");
  };

  const totalPages = Math.ceil(links.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLinks = links.slice(startIndex, endIndex);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Başlık
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Hedef URL
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Kısa URL
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Durum
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Tıklanma
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                İşlemler
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
                </TableCell>
              </TableRow>
            ) : paginatedLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    Henüz özel link eklenmemiş.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {link.title}
                      </p>
                      {link.description && (
                        <p className="text-gray-500 text-theme-xs dark:text-gray-400 mt-1">
                          {link.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <a
                      href={link.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-theme-xs dark:text-blue-400 break-all"
                    >
                      {link.targetUrl.length > 50
                        ? `${link.targetUrl.substring(0, 50)}...`
                        : link.targetUrl}
                    </a>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`${baseUrl}/${link.shortUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-theme-xs dark:text-blue-400"
                      >
                        {baseUrl}/{link.shortUrl}
                      </a>
                      <button
                        onClick={() => copyToClipboard(`${baseUrl}/${link.shortUrl}`)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <CopyIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge
                      className={
                        link.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }
                    >
                      {link.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                    {link.clickCount.toLocaleString("tr-TR")}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/custom-links/${link.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(link.id)}
                        disabled={deletingId === link.id}
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

