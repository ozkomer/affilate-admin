"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashBinIcon, CopyIcon } from "@/icons";
import Link from "next/link";
import Button from "../ui/button/Button";
import Image from "next/image";
import Label from "../form/Label";
import Select from "../form/Select";
import Pagination from "../tables/Pagination";

interface List {
  id: string;
  title: string;
  slug: string;
  shortUrl: string | null;
  description: string | null;
  coverImage: string | null;
  youtubeUrl: string | null;
  isFeatured: boolean;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  linkCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ListTableProps {
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

export function ListTable({ showFilters = false, onToggleFilters }: ListTableProps) {
  const [lists, setLists] = useState<List[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; color: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLists();
    fetchCategories();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/lists");
      if (response.ok) {
        const data = await response.json();
        setLists(data);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredLists = useMemo(() => {
    return lists.filter((list) => {
      // Arama filtresi
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          list.title.toLowerCase().includes(query) ||
          (list.description && list.description.toLowerCase().includes(query)) ||
          (list.slug && list.slug.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Kategori filtresi
      if (selectedCategoryId && list.category?.id !== selectedCategoryId) {
        return false;
      }

      // Öne çıkan filtresi
      if (featuredFilter === "featured" && !list.isFeatured) {
        return false;
      }
      if (featuredFilter === "not-featured" && list.isFeatured) {
        return false;
      }

      return true;
    });
  }, [lists, searchQuery, selectedCategoryId, featuredFilter]);

  // Pagination hesaplamaları
  const totalPages = Math.ceil(filteredLists.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLists = filteredLists.slice(startIndex, endIndex);

  // Filtre değiştiğinde ilk sayfaya dön
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryId, featuredFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu listeyi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/lists/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchLists();
      } else {
        const error = await response.json();
        alert(error.error || "Liste silinirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      alert("Liste silinirken bir hata oluştu");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  const categoryOptions = [
    { value: "", label: "Tüm Kategoriler" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  const featuredOptions = [
    { value: "all", label: "Tümü" },
    { value: "featured", label: "Öne Çıkan" },
    { value: "not-featured", label: "Öne Çıkmayan" },
  ];

  if (lists.length === 0 && !loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Henüz liste eklenmemiş.
        </p>
        <Link href="/lists/new">
          <Button size="sm">İlk Listeyi Oluştur</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtreler */}
      {showFilters && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Arama */}
            <div>
              <Label>Ara</Label>
              <input
                type="text"
                placeholder="Liste adı, açıklama, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Kategori Filtresi */}
            <div>
              <Label>Kategori</Label>
              <Select
                options={categoryOptions}
                value={selectedCategoryId}
                onChange={(value) => setSelectedCategoryId(value)}
                placeholder="Tüm Kategoriler"
              />
            </div>

            {/* Öne Çıkan Filtresi */}
            <div>
              <Label>Öne Çıkan</Label>
              <Select
                options={featuredOptions}
                value={featuredFilter}
                onChange={(value) => setFeaturedFilter(value)}
                placeholder="Tümü"
              />
            </div>
          </div>

          {/* Filtre Sonuçları */}
          {(searchQuery || selectedCategoryId || featuredFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredLists.length} sonuç bulundu
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryId("");
                  setFeaturedFilter("all");
                }}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tablo */}
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
                  Kapak
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Liste Adı
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
                  Kategori
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ürün Sayısı
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Öne Çıkan
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
              {paginatedLists.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      Filtre kriterlerinize uygun liste bulunamadı.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLists.map((list) => {
                  const baseUrl = (typeof window !== 'undefined' 
                    ? (process.env.NEXT_PUBLIC_BASE_URL || 'https://eneso.cc')
                    : 'https://eneso.cc');
                  const shortUrlFull = list.shortUrl ? `${baseUrl}/l/${list.shortUrl}` : '';
                  return (
                    <TableRow key={list.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    {list.coverImage ? (
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <Image
                            src={list.coverImage}
                            alt={list.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        {/* Hover preview */}
                        <div className="absolute left-0 top-full mt-2 z-50 hidden group-hover:block pointer-events-none">
                          <div className="w-64 h-64 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                            <Image
                              src={list.coverImage}
                              alt={list.title}
                              width={256}
                              height={256}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 text-xs text-center px-2">Resim Yok</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {list.title}
                      </span>
                      {list.description && (
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400 line-clamp-1 mt-1">
                          {list.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {list.shortUrl ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={shortUrlFull}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-500 hover:text-brand-600 text-theme-sm dark:text-brand-400"
                        >
                          /l/{list.shortUrl}
                        </a>
                        <button
                          onClick={() => copyToClipboard(shortUrlFull)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          title="Kopyala"
                        >
                          <CopyIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-theme-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {list.category ? (
                      <Badge
                        style={{
                          backgroundColor: list.category.color || "#6366f1",
                        }}
                        className="text-white"
                      >
                        {list.category.name}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-theme-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {list.linkCount}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {list.isFeatured ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Evet
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-theme-xs">Hayır</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/lists/${list.id}/edit`}>
                        <button
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          title="Düzenle"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(list.id)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        title="Sil"
                      >
                        <TrashBinIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-white/[0.05]">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Toplam {filteredLists.length} sonuçtan {startIndex + 1}-{Math.min(endIndex, filteredLists.length)} arası gösteriliyor
          </div>
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