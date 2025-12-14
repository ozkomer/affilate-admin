"use client";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { MoreDotIcon } from "@/icons";
import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function MonthlyTarget() {
  const [totalClicks, setTotalClicks] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTotalClicks = async () => {
      try {
        const response = await fetch("/api/links");
        if (response.ok) {
          const links = await response.json();
          const total = links.reduce((sum: number, link: any) => sum + (link.clickCount || 0), 0);
          setTotalClicks(total);
        }
      } catch (error) {
        console.error("Error fetching total clicks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalClicks();
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Toplam Linklere Tıklanma Adeti
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              Tüm linklerinize yapılan toplam tıklama sayısı
            </p>
          </div>
          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                tag="a"
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                tag="a"
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
        <div className="relative flex items-center justify-center py-12">
          <div className="text-center">
            <h4 className="text-5xl font-bold text-gray-800 dark:text-white/90">
              {loading ? "..." : totalClicks.toLocaleString("tr-TR")}
            </h4>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Toplam Tıklama
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
