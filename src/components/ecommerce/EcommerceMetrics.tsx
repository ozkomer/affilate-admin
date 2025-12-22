"use client";
import React, { useState, useEffect } from "react";
import { PaperPlaneIcon, ListIcon, EyeIcon, BoltIcon } from "@/icons";

export const EcommerceMetrics = () => {
  const [totalLinks, setTotalLinks] = useState<number>(0);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [totalListClicks, setTotalListClicks] = useState<number>(0);
  const [totalProductClicks, setTotalProductClicks] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch links
        const linksResponse = await fetch("/api/links");
        if (linksResponse.ok) {
          const links = await linksResponse.json();
          setTotalLinks(links.length || 0);
        }

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (categoriesResponse.ok) {
          const categories = await categoriesResponse.json();
          setTotalCategories(categories.length || 0);
        }

        // Fetch list click statistics
        const listClicksResponse = await fetch("/api/statistics/list-clicks");
        if (listClicksResponse.ok) {
          const stats = await listClicksResponse.json();
          console.log('List click stats:', stats);
          // Use totalClickCount (sum of clickCount from CuratedList) as primary source
          // This is more reliable as it's always updated when clicks happen
          setTotalListClicks(stats.totalClickCount || stats.totalListClicks || 0);
        } else {
          console.error('Failed to fetch list clicks:', listClicksResponse.status);
          const errorText = await listClicksResponse.text();
          console.error('Error details:', errorText);
        }

        // Fetch product click statistics
        const productClicksResponse = await fetch("/api/statistics/product-clicks");
        if (productClicksResponse.ok) {
          const stats = await productClicksResponse.json();
          console.log('Product click stats:', stats);
          // Use totalClickCount (sum of clickCount from AffiliateLink) as primary source
          setTotalProductClicks(stats.totalClickCount || stats.totalProductClicks || 0);
        } else {
          console.error('Failed to fetch product clicks:', productClicksResponse.status);
          const errorText = await productClicksResponse.text();
          console.error('Error details:', errorText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <PaperPlaneIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Toplam Link Adeti
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : totalLinks.toLocaleString("tr-TR")}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ListIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Toplam Kategori
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : totalCategories.toLocaleString("tr-TR")}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start - Liste Tıklamaları --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <EyeIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Liste Tıklamaları
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : totalListClicks.toLocaleString("tr-TR")}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start - Ürün Tıklamaları --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoltIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ürün Tıklamaları
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : totalProductClicks.toLocaleString("tr-TR")}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
