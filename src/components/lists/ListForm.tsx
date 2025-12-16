"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import ImageUpload from "@/components/form/ImageUpload";

interface ListFormProps {
  listId?: string;
  initialData?: {
    title: string;
    description: string | null;
    coverImage: string | null;
    youtubeUrl: string | null;
    categoryId: string | null;
    isFeatured: boolean;
    linkIds: string[];
  };
}

interface Category {
  id: string;
  name: string;
}

interface EcommerceBrand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

interface AffiliateLink {
  id: string;
  title: string;
  shortUrl: string;
  imageUrl: string | null;
  categoryId: string | null;
  ecommerceBrandId: string | null;
  category: { name: string } | null;
  ecommerceBrand: { name: string; logo: string | null } | null;
}

export default function ListForm({
  listId,
  initialData,
}: ListFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<EcommerceBrand[]>([]);
  const [allLinks, setAllLinks] = useState<AffiliateLink[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    coverImage: initialData?.coverImage || "",
    youtubeUrl: initialData?.youtubeUrl || "",
    categoryId: initialData?.categoryId || "",
    isFeatured: initialData?.isFeatured || false,
    linkIds: initialData?.linkIds || [] as string[],
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchLinks();
    if (listId && !initialData) {
      fetchList();
    }
  }, [listId]);

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

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links");
      if (response.ok) {
        const data = await response.json();
        setAllLinks(data);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const fetchList = async () => {
    try {
      const response = await fetch(`/api/lists/${listId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title,
          description: data.description || "",
          coverImage: data.coverImage || "",
          youtubeUrl: data.youtubeUrl || "",
          categoryId: data.categoryId || "",
          isFeatured: data.isFeatured || false,
          linkIds: data.links?.map((l: any) => l.linkId) || [],
        });
      }
    } catch (error) {
      console.error("Error fetching list:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        coverImage: formData.coverImage || null,
        youtubeUrl: formData.youtubeUrl || null,
        categoryId: formData.categoryId || null,
        isFeatured: formData.isFeatured,
        linkIds: formData.linkIds,
      };

      const url = listId ? `/api/lists/${listId}` : "/api/lists";
      const method = listId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/lists");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Bir hata oluştu");
      }
    } catch (error) {
      console.error("Error saving list:", error);
      alert("Liste kaydedilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const toggleLink = (linkId: string) => {
    setFormData((prev) => ({
      ...prev,
      linkIds: prev.linkIds.includes(linkId)
        ? prev.linkIds.filter((id) => id !== linkId)
        : [...prev.linkIds, linkId],
    }));
  };

  // Filtrelenmiş linkler
  const filteredLinks = allLinks.filter((link) => {
    // Kategori filtresi
    if (formData.categoryId && link.categoryId !== formData.categoryId) {
      return false;
    }
    // E-ticaret markası filtresi
    if (selectedBrandId && link.ecommerceBrandId !== selectedBrandId) {
      return false;
    }
    // Arama filtresi
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        link.title.toLowerCase().includes(query) ||
        link.category?.name.toLowerCase().includes(query) ||
        link.ecommerceBrand?.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <ComponentCard title={listId ? "Liste Düzenle" : "Yeni Liste Oluştur"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>
            Liste Başlığı <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="Liste başlığı"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label>Açıklama</Label>
          <TextArea
            placeholder="Liste hakkında açıklama (opsiyonel)"
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            disabled={loading}
            rows={3}
          />
        </div>

        <div>
          <ImageUpload
            label="Kapak Resmi"
            value={formData.coverImage}
            onChange={(url) =>
              setFormData({ ...formData, coverImage: url })
            }
            bucket="list-covers"
            folder="covers"
            disabled={loading}
            maxSizeMB={5}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Liste için kapak resmi yükleyin (opsiyonel)
          </p>
        </div>

        <div>
          <Label>YouTube Video URL</Label>
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={formData.youtubeUrl}
            onChange={(e) =>
              setFormData({ ...formData, youtubeUrl: e.target.value })
            }
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>E-ticaret Markası</Label>
            <Select
              options={[
                { value: "", label: "Tüm Markalar" },
                ...(brands || []).map((brand) => ({
                  value: brand.id,
                  label: brand.name,
                })),
              ]}
              value={selectedBrandId}
              onChange={(value) => setSelectedBrandId(value)}
              placeholder="Marka Seçin"
              className={loading ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>

          <div>
            <Label>Kategori</Label>
            <Select
              options={[
                { value: "", label: "Tüm Kategoriler" },
                ...(categories || []).map((category) => ({
                  value: category.id,
                  label: category.name,
                })),
              ]}
              value={formData.categoryId}
              onChange={(value) =>
                setFormData({ ...formData, categoryId: value, linkIds: [] })
              }
              placeholder="Kategori Seçin"
              className={loading ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
        </div>

        <div>
          <Label>Öne Çıkan Liste</Label>
          <div className="flex items-center gap-3">
            <Switch
              key={formData.isFeatured ? 'featured' : 'not-featured'}
              label=""
              defaultChecked={formData.isFeatured}
              onChange={(checked) =>
                setFormData({ ...formData, isFeatured: checked })
              }
              disabled={loading}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formData.isFeatured ? "Evet" : "Hayır"}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Öne çıkan listeler anasayfada gösterilir
          </p>
        </div>

        <div>
          <Label>Ürünler (Linkler)</Label>
          
          {/* Arama ve Filtre Bilgisi */}
          {(selectedBrandId || formData.categoryId) && (
            <div className="mt-2 mb-3">
              <Input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {selectedBrandId && formData.categoryId
                  ? `${brands.find((b) => b.id === selectedBrandId)?.name} ve seçili kategoriye göre filtreleniyor`
                  : selectedBrandId
                  ? `${brands.find((b) => b.id === selectedBrandId)?.name} markasına göre filtreleniyor`
                  : "Seçili kategoriye göre filtreleniyor"}
                {filteredLinks.length > 0 && ` • ${filteredLinks.length} ürün bulundu`}
              </p>
            </div>
          )}

          <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            {allLinks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Henüz link eklenmemiş. Önce link oluşturun.
              </p>
            ) : filteredLinks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedBrandId || formData.categoryId
                  ? "Seçilen kriterlere uygun ürün bulunamadı."
                  : "Ürün bulunamadı."}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredLinks.map((link) => (
                  <label
                    key={link.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.linkIds.includes(link.id)}
                      onChange={() => toggleLink(link.id)}
                      disabled={loading}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    {link.imageUrl || link.ecommerceBrand?.logo ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                        {link.imageUrl ? (
                          <Image
                            src={link.imageUrl}
                            alt={link.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : link.ecommerceBrand?.logo ? (
                          <Image
                            src={link.ecommerceBrand.logo}
                            alt={link.ecommerceBrand.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                            unoptimized
                          />
                        ) : null}
                      </div>
                    ) : null}
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {link.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {link.category?.name || "Kategori yok"} • {link.ecommerceBrand?.name || "Marka yok"}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Seçilen ürünler: {formData.linkIds.length}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" size="sm" disabled={loading}>
            {loading
              ? "Kaydediliyor..."
              : listId
              ? "Güncelle"
              : "Oluştur"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            İptal
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}

