"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import Pagination from "@/components/tables/Pagination";
import DatePicker from "@/components/form/date-picker";
import { DownloadIcon } from "@/icons";

interface ClickReport {
  id: string;
  type: string;
  title: string;
  shortUrl: string;
  category: string;
  brand: string;
  timestamp: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  ipAddress: string;
  referrer: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ReportsPage() {
  const [clicks, setClicks] = useState<ClickReport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  // Calculate default dates (last 3 days)
  const getDefaultDates = () => {
    const end = new Date();
    end.setHours(23, 59, 59, 999); // End of today
    const start = new Date();
    start.setDate(start.getDate() - 3);
    start.setHours(0, 0, 0, 0); // Start of 3 days ago
    
    // Format for flatpickr: Y-m-d H:i
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };
    
    return {
      start: formatDate(start),
      end: formatDate(end),
      startDateObj: start,
      endDateObj: end,
    };
  };

  const defaultDates = getDefaultDates();

  // Filters
  const [startDate, setStartDate] = useState<string>(defaultDates.start);
  const [endDate, setEndDate] = useState<string>(defaultDates.end);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, typeFilter, categoryFilter]);

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

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // Convert datetime string to ISO format for API
      if (startDate) {
        const startDateObj = new Date(startDate.replace(' ', 'T'));
        params.append("startDate", startDateObj.toISOString());
      }
      if (endDate) {
        const endDateObj = new Date(endDate.replace(' ', 'T'));
        params.append("endDate", endDateObj.toISOString());
      }
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (categoryFilter !== "all") params.append("categoryId", categoryFilter);

      const response = await fetch(`/api/reports/clicks?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClicks(data.clicks || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      // Convert datetime string to ISO format for API
      if (startDate) {
        const startDateObj = new Date(startDate.replace(' ', 'T'));
        params.append("startDate", startDateObj.toISOString());
      }
      if (endDate) {
        const endDateObj = new Date(endDate.replace(' ', 'T'));
        params.append("endDate", endDateObj.toISOString());
      }
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (categoryFilter !== "all") params.append("categoryId", categoryFilter);

      const response = await fetch(`/api/reports/clicks/export?${params.toString()}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tiklama-raporu_${startDate || "tumu"}_${endDate || "tumu"}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Excel export başarısız oldu");
      }
    } catch (error) {
      console.error("Error exporting reports:", error);
      alert("Excel export sırasında bir hata oluştu");
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination
  const totalPages = Math.ceil(clicks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClicks = clicks.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, typeFilter, categoryFilter]);

  const baseUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_BASE_URL || 'https://eneso.cc')
    : 'https://eneso.cc';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageBreadcrumb pageTitle="Tıklama Raporları" />
        <Button
          size="sm"
          onClick={handleExport}
          disabled={exporting || clicks.length === 0}
          className="flex items-center gap-2"
        >
          <DownloadIcon className="w-4 h-4" />
          {exporting ? "İndiriliyor..." : "Excel'e Aktar"}
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <DatePicker
              id="start-date"
              label="Başlangıç Tarihi"
              enableTime={true}
              dateFormat="Y-m-d H:i"
              placeholder="Başlangıç tarihi seçin"
              defaultDate={defaultDates.startDateObj}
              onChange={(dates, dateStr) => {
                if (dateStr) {
                  setStartDate(dateStr);
                } else if (dates && dates.length > 0) {
                  // Fallback: format the date manually
                  const date = new Date(dates[0]);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  setStartDate(`${year}-${month}-${day} ${hours}:${minutes}`);
                }
              }}
            />
          </div>
          <div>
            <DatePicker
              id="end-date"
              label="Bitiş Tarihi"
              enableTime={true}
              dateFormat="Y-m-d H:i"
              placeholder="Bitiş tarihi seçin"
              defaultDate={defaultDates.endDateObj}
              onChange={(dates, dateStr) => {
                if (dateStr) {
                  setEndDate(dateStr);
                } else if (dates && dates.length > 0) {
                  // Fallback: format the date manually
                  const date = new Date(dates[0]);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  setEndDate(`${year}-${month}-${day} ${hours}:${minutes}`);
                }
              }}
            />
          </div>
          <div>
            <Label>Tip</Label>
            <Select
              value={typeFilter}
              onChange={(value) => setTypeFilter(value)}
              options={[
                { value: "all", label: "Tümü" },
                { value: "product", label: "Ürün" },
                { value: "list", label: "Liste" },
              ]}
            />
          </div>
          <div>
            <Label>Kategori</Label>
            <Select
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              options={[
                { value: "all", label: "Tüm Kategoriler" },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Toplam: <strong>{clicks.length}</strong> tıklama bulundu
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Tip
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Başlık
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Kısa URL
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Kategori
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Marka
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Tarih
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Ülke
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Şehir
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Cihaz
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Tarayıcı
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="px-5 py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
                  </TableCell>
                </TableRow>
              ) : paginatedClicks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="px-5 py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      Filtre kriterlerinize uygun tıklama bulunamadı.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClicks.map((click) => (
                  <TableRow key={click.id}>
                    <TableCell className="px-5 py-4">
                      <Badge
                        className={
                          click.type === "Ürün"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        }
                      >
                        {click.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90">
                      {click.title}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <a
                        href={`${baseUrl}/${click.shortUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-theme-xs dark:text-blue-400"
                      >
                        {baseUrl}/{click.shortUrl}
                      </a>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {click.category}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {click.brand}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDate(click.timestamp)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {click.country}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {click.city}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {click.device}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {click.browser}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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
    </div>
  );
}

