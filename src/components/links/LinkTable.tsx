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
import { CopyIcon, PencilIcon, TrashBinIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Button from "../ui/button/Button";
import Select from "../form/Select";
import Label from "../form/Label";
import Pagination from "../tables/Pagination";

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

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface EcommerceBrand {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  logo: string | null;
}

interface LinkTableProps {
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

export default function LinkTable({ showFilters = false, onToggleFilters }: LinkTableProps) {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<EcommerceBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLinks();
    fetchCategories();
    fetchBrands();
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

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      // Arama filtresi
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          link.title.toLowerCase().includes(query) ||
          (link.description && link.description.toLowerCase().includes(query)) ||
          link.originalUrl.toLowerCase().includes(query) ||
          link.shortUrl.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Kategori filtresi
      if (selectedCategoryId && link.category?.id !== selectedCategoryId) {
        return false;
      }

      // Marka filtresi
      if (selectedBrandId && link.ecommerceBrand?.id !== selectedBrandId) {
        return false;
      }

      // Durum filtresi
      if (statusFilter === "active" && !link.isActive) {
        return false;
      }
      if (statusFilter === "inactive" && link.isActive) {
        return false;
      }

      return true;
    });
  }, [links, searchQuery, selectedCategoryId, selectedBrandId, statusFilter]);

  // Pagination hesaplamaları
  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLinks = filteredLinks.slice(startIndex, endIndex);

  // Filtre veya sayfa değiştiğinde ilk sayfaya dön
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryId, selectedBrandId, statusFilter]);

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

  const categoryOptions = [
    { value: "", label: "Tüm Kategoriler" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  const brandOptions = [
    { value: "", label: "Tüm Markalar" },
    ...brands.map((brand) => ({
      value: brand.id,
      label: brand.name,
    })),
  ];

  const statusOptions = [
    { value: "all", label: "Tümü" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Pasif" },
  ];

  if (links.length === 0 && !loading) {
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
    <div className="space-y-4">
      {/* Filtreler */}
      {showFilters && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Arama */}
          <div>
            <Label>Ara</Label>
            <input
              type="text"
              placeholder="Başlık, açıklama, URL..."
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

          {/* Marka Filtresi */}
          <div>
            <Label>Marka</Label>
            <Select
              options={brandOptions}
              value={selectedBrandId}
              onChange={(value) => setSelectedBrandId(value)}
              placeholder="Tüm Markalar"
            />
          </div>

          {/* Durum Filtresi */}
          <div>
            <Label>Durum</Label>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              placeholder="Tümü"
            />
          </div>
          </div>
          
          {/* Aktif Filtreler */}
          {(searchQuery || selectedCategoryId || selectedBrandId || statusFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredLinks.length} sonuç bulundu
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryId("");
                  setSelectedBrandId("");
                  setStatusFilter("all");
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
                {paginatedLinks.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-5 py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Filtre kriterlerinize uygun link bulunamadı.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLinks.map((link) => {
                    const baseUrl = (typeof window !== 'undefined' 
                      ? (process.env.NEXT_PUBLIC_BASE_URL || 'https://eneso.cc')
                      : 'https://eneso.cc');
                    const shortUrlFull = `${baseUrl}/${link.shortUrl}`;
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
                            /{link.shortUrl}
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
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-white/[0.05]">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Toplam {filteredLinks.length} sonuçtan {startIndex + 1}-{Math.min(endIndex, filteredLinks.length)} arası gösteriliyor
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
