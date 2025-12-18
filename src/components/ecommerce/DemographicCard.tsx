"use client";
import Image from "next/image";

import CountryMap from "./CountryMap";
import { useState, useEffect } from "react";

interface CountryData {
  name: string;
  count: number;
  percentage: number;
}

interface CityData {
  name: string;
  city?: string;
  country?: string;
  count: number;
  percentage: number;
}

export default function DemographicCard() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        const response = await fetch("/api/clicks/demographics");
        if (response.ok) {
          const data = await response.json();
          setCountries(data.countries || []);
          setCities(data.cities || []);
        }
      } catch (error) {
        console.error("Error fetching demographics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemographics();
  }, []);

  // Get country flag image path (fallback to default if not found)
  const getCountryFlag = (countryName: string) => {
    // Map common country names to flag images
    const countryFlags: Record<string, string> = {
      "Turkey": "/images/country/country-01.svg",
      "United States": "/images/country/country-01.svg",
      "USA": "/images/country/country-01.svg",
      "France": "/images/country/country-02.svg",
      "Germany": "/images/country/country-03.svg",
      "United Kingdom": "/images/country/country-04.svg",
      "UK": "/images/country/country-04.svg",
      "Italy": "/images/country/country-05.svg",
      "Spain": "/images/country/country-06.svg",
    };
    
    return countryFlags[countryName] || "/images/country/country-01.svg";
  };

  // Get cities for a specific country
  const getCitiesForCountry = (countryName: string): CityData[] => {
    return cities.filter((city) => city.country === countryName).slice(0, 5); // Top 5 cities per country
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Tıklayan Kullanıcıların Demografisi
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Ülke ve şehir bazında tıklama sayıları
          </p>
        </div>
      </div>
      <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap />
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Yükleniyor...
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Henüz veri yok
          </div>
        ) : (
          countries.map((country, index) => {
            const countryCities = getCitiesForCountry(country.name);
            return (
              <div key={index} className="space-y-3">
                {/* Country Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="items-center w-full rounded-full max-w-8">
                      <Image
                        width={48}
                        height={48}
                        src={getCountryFlag(country.name)}
                        alt={country.name}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                        {country.name}
                      </p>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {country.count.toLocaleString("tr-TR")} Tıklama
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full max-w-[140px] items-center gap-3">
                    <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                      <div
                        className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {country.percentage}%
                    </p>
                  </div>
                </div>

                {/* Cities for this country */}
                {countryCities.length > 0 && (
                  <div className="ml-11 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                    {countryCities.map((city, cityIndex) => (
                      <div key={cityIndex} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                          <div>
                            <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-300">
                              {city.city || city.name}
                            </p>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {city.count.toLocaleString("tr-TR")} Tıklama
                            </span>
                          </div>
                        </div>

                        <div className="flex w-full max-w-[120px] items-center gap-3">
                          <div className="relative block h-1.5 w-full max-w-[80px] rounded-sm bg-gray-200 dark:bg-gray-800">
                            <div
                              className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-400 text-xs font-medium text-white"
                              style={{ width: `${city.percentage}%` }}
                            ></div>
                          </div>
                          <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-300">
                            {city.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
