"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { CheckCircleIcon, CloseIcon, AlertIcon } from "@/icons";

// Simple loading spinner component
const LoaderIcon = ({ className }: { className?: string }) => (
  <svg
    className={`animate-spin ${className || ""}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

interface LinkCheckResult {
  linkId: string;
  productUrlId: string;
  title: string;
  url: string;
  status: "valid" | "invalid" | "error";
  statusCode?: number;
  finalUrl?: string;
  error?: string;
}

interface CheckSummary {
  total: number;
  valid: number;
  invalid: number;
  error: number;
}

export default function LinkChecker() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LinkCheckResult[]>([]);
  const [summary, setSummary] = useState<CheckSummary | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setResults([]);
    setSummary(null);

    try {
      const response = await fetch("/api/links/check");
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setSummary(data.summary || null);
      } else {
        const error = await response.json();
        alert(error.error || "Link kontrolü başarısız oldu");
      }
    } catch (error) {
      console.error("Error checking links:", error);
      alert("Link kontrolü sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
        );
      case "invalid":
        return (
          <CloseIcon className="w-5 h-5 text-red-500" />
        );
      case "error":
        return (
          <AlertIcon className="w-5 h-5 text-yellow-500" />
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400">
            Geçerli
          </span>
        );
      case "invalid":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full dark:bg-red-900/30 dark:text-red-400">
            Geçersiz
          </span>
        );
      case "error":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">
            Hata
          </span>
        );
      default:
        return null;
    }
  };

  const validResults = results.filter((r) => r.status === "valid");
  const invalidResults = results.filter((r) => r.status === "invalid");
  const errorResults = results.filter((r) => r.status === "error");

  return (
    <div className="space-y-6">
      <ComponentCard title="Hepsiburada Link Kontrolü">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Hepsiburada markasına ait tüm linkleri kontrol eder. Geçersiz linkler (anasayfaya yönlendiren) tespit edilir.
          </p>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleCheck}
              disabled={loading}
              size="sm"
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <LoaderIcon className="w-4 h-4" />
                  Kontrol Ediliyor...
                </>
              ) : (
                "Linkleri Kontrol Et"
              )}
            </Button>

            {summary && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Toplam: <strong>{summary.total}</strong>
                </span>
                <span className="text-green-600 dark:text-green-400">
                  Geçerli: <strong>{summary.valid}</strong>
                </span>
                <span className="text-red-600 dark:text-red-400">
                  Geçersiz: <strong>{summary.invalid}</strong>
                </span>
                {summary.error > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    Hata: <strong>{summary.error}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </ComponentCard>

      {results.length > 0 && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Geçerli Linkler
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {summary?.valid || 0}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
            </ComponentCard>

            <ComponentCard title="">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Geçersiz Linkler
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {summary?.invalid || 0}
                  </p>
                </div>
                <CloseIcon className="w-8 h-8 text-red-500" />
              </div>
            </ComponentCard>

            {summary && summary.error > 0 && (
              <ComponentCard title="">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Hata
                    </p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {summary.error}
                    </p>
                  </div>
                  <AlertIcon className="w-8 h-8 text-yellow-500" />
                </div>
              </ComponentCard>
            )}
          </div>

          {/* Results Table */}
          <ComponentCard title="Kontrol Sonuçları">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Ürün Adı
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      URL
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Yönlendirme
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Detay
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          {getStatusBadge(result.status)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {result.title}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate max-w-md block"
                        >
                          {result.url}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {result.finalUrl && result.finalUrl !== result.url && (
                          <a
                            href={result.finalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 dark:text-gray-400 hover:underline truncate max-w-md block"
                          >
                            {result.finalUrl}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {result.statusCode && (
                            <span>HTTP {result.statusCode}</span>
                          )}
                          {result.error && (
                            <span className="text-red-600 dark:text-red-400">
                              {result.error}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ComponentCard>

          {/* Invalid Links Section */}
          {invalidResults.length > 0 && (
            <ComponentCard title="Geçersiz Linkler" className="border-l-4 border-red-500">
              <div className="space-y-3">
                {invalidResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          {result.title}
                        </p>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {result.url}
                        </a>
                        {result.finalUrl && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Yönlendirme: {result.finalUrl}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ComponentCard>
          )}
        </div>
      )}
    </div>
  );
}

