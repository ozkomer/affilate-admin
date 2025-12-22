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
import { PencilIcon, TrashBinIcon, ArrowUpIcon, ArrowDownIcon } from "@/icons";
import Link from "next/link";
import Button from "../ui/button/Button";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  imageUrl: string | null;
  order: number;
  createdAt: string;
  _count?: {
    links: number;
  };
}

interface CategoryTableProps {
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

export default function CategoryTable({ showFilters = false, onToggleFilters }: CategoryTableProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCategories();
        setSelectedIds(new Set());
      } else {
        const error = await response.json();
        alert(error.error || "Kategori silinirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Kategori silinirken bir hata oluştu");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert("Lütfen silmek için en az bir kategori seçin");
      return;
    }

    const count = selectedIds.size;
    if (!confirm(`${count} kategoriyi silmek istediğinize emin misiniz?`)) {
      return;
    }

    setBulkDeleting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      const deletePromises = Array.from(selectedIds).map(async (id) => {
        try {
          const response = await fetch(`/api/categories/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            successCount++;
          } else {
            const error = await response.json();
            const category = categories.find((c) => c.id === id);
            errors.push(`${category?.name || id}: ${error.error || "Silinemedi"}`);
          }
        } catch (error) {
          const category = categories.find((c) => c.id === id);
          errors.push(`${category?.name || id}: Silinemedi`);
        }
      });

      await Promise.all(deletePromises);

      if (errors.length > 0) {
        alert(
          `${successCount} kategori silindi. Hatalar:\n${errors.join("\n")}`
        );
      } else {
        alert(`${successCount} kategori başarıyla silindi`);
      }

      setSelectedIds(new Set());
      fetchCategories();
    } catch (error) {
      console.error("Error bulk deleting categories:", error);
      alert("Kategoriler silinirken bir hata oluştu");
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === categories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(categories.map((c) => c.id)));
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    // Optimistic update - immediately update the UI
    const currentIndex = categories.findIndex((cat) => cat.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    // Create a new array with swapped items
    const newCategories = [...categories];
    [newCategories[currentIndex], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[currentIndex],
    ];
    setCategories(newCategories);

    // Update on server
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) {
        // Revert on error
        fetchCategories();
        const error = await response.json();
        alert(error.error || "Sıralama değiştirilirken bir hata oluştu");
      } else {
        // Refresh to ensure consistency
        fetchCategories();
      }
    } catch (error) {
      // Revert on error
      fetchCategories();
      console.error("Error moving category:", error);
      alert("Sıralama değiştirilirken bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Henüz kategori eklenmemiş.
        </p>
        <Link href="/categories/new">
          <Button size="sm">İlk Kategoriyi Oluştur</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
            {selectedIds.size} kategori seçildi
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
          >
            {bulkDeleting ? "Siliniyor..." : `Seçilenleri Sil (${selectedIds.size})`}
          </Button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-12"
                  >
                    <input
                      type="checkbox"
                      checked={categories.length > 0 && selectedIds.size === categories.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Avatar
                  </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Kategori Adı
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Açıklama
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Renk
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Link Sayısı
                </TableCell>
                <TableCell
                  isHeader
                  className="px-2 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Sıralama
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 min-w-[80px]"
                >
                  İşlemler
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(category.id)}
                      onChange={() => toggleSelect(category.id)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    {category.imageUrl ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                        style={{
                          backgroundColor: category.color || "#6366f1",
                        }}
                      >
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {category.name}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {category.description || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {category.color ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {category.color}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-theme-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {category._count?.links || 0}
                  </TableCell>
                  <TableCell className="px-2 py-3">
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleMove(category.id, "up")}
                        disabled={categories.findIndex((c) => c.id === category.id) === 0}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Yukarı taşı"
                      >
                        <ArrowUpIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleMove(category.id, "down")}
                        disabled={categories.findIndex((c) => c.id === category.id) === categories.length - 1}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Aşağı taşı"
                      >
                        <ArrowDownIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3 min-w-[80px]">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/categories/${category.id}/edit`}>
                        <button
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex-shrink-0"
                          title="Düzenle"
                        >
                          <PencilIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex-shrink-0"
                        title="Sil"
                      >
                        <TrashBinIcon className="w-3.5 h-3.5 text-red-500" />
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
    </div>
  );
}


