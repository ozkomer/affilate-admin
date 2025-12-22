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

interface ListUrl {
  id?: string;
  ecommerceBrandId: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

interface ListFormProps {
  listId?: string;
  initialData?: {
    title: string;
    description: string | null;
    coverImage: string | null;
    youtubeUrl: string | null;
    categoryId: string | null;
    isFeatured: boolean;
    showDirectLinks: boolean;
    linkIds: string[];
    listUrls?: ListUrl[];
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
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    coverImage: initialData?.coverImage || "",
    youtubeUrl: initialData?.youtubeUrl || "",
    categoryId: initialData?.categoryId || "",
    isFeatured: initialData?.isFeatured || false,
    showDirectLinks: initialData?.showDirectLinks || false,
    linkIds: initialData?.linkIds || [] as string[],
    listUrls: initialData?.listUrls || [] as ListUrl[],
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchLinks();
    if (listId && !initialData) {
      fetchList();
    }
  }, [listId]);

  // Update categoryId when categories are loaded and list has a category
  useEffect(() => {
    if (categories.length > 0 && listId && formData.categoryId) {
      // Ensure categoryId is valid (exists in categories)
      const categoryExists = categories.some(cat => cat.id === formData.categoryId);
      if (!categoryExists && formData.categoryId) {
        // Category ID exists in formData but not in categories list, keep it
        // This might happen if category was deleted, but we still want to show it
      }
    }
  }, [categories, listId, formData.categoryId]);

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
        // Handle listUrls
        let listUrlsData: ListUrl[] = [];
        if (data.listUrls && data.listUrls.length > 0) {
          listUrlsData = data.listUrls.map((lu: any) => ({
            id: lu.id,
            ecommerceBrandId: lu.ecommerceBrandId,
            url: lu.url,
            isPrimary: lu.isPrimary || false,
            order: lu.order || 0,
          }));
        }
        setFormData({
          title: data.title,
          description: data.description || "",
          coverImage: data.coverImage || "",
          youtubeUrl: data.youtubeUrl || "",
          categoryId: data.categoryId || "",
          isFeatured: data.isFeatured || false,
          showDirectLinks: data.showDirectLinks || false,
          linkIds: data.links?.map((l: any) => l.linkId) || [],
          listUrls: listUrlsData,
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
      // Validate listUrls
      const validListUrls = formData.listUrls.filter(
        (lu) => lu.ecommerceBrandId && lu.url.trim()
      );

      const payload = {
        title: formData.title,
        description: formData.description || null,
        coverImage: formData.coverImage || null,
        youtubeUrl: formData.youtubeUrl || null,
        categoryId: formData.categoryId || null,
        isFeatured: formData.isFeatured,
        showDirectLinks: formData.showDirectLinks,
        linkIds: formData.linkIds,
        listUrls: validListUrls.map(lu => ({
          ecommerceBrandId: lu.ecommerceBrandId,
          url: lu.url,
          isPrimary: lu.isPrimary,
          order: lu.order,
        })),
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

        <div>
          <Label>Kategori</Label>
          <Select
            options={[
              { value: "", label: "Kategori Seçin" },
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
          <Label>Liste Linklerini Göster</Label>
          <div className="flex items-center gap-3">
            <Switch
              key={formData.showDirectLinks ? 'direct-links' : 'product-links'}
              label=""
              defaultChecked={formData.showDirectLinks}
              onChange={(checked) =>
                setFormData({ ...formData, showDirectLinks: checked })
              }
              disabled={loading}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formData.showDirectLinks ? "Liste Linkleri" : "Ürün Linkleri"}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.showDirectLinks 
              ? "Liste detay sayfasında direkt liste linkleri gösterilecek (Amazon, Hepsiburada vb.)"
              : "Liste detay sayfasında ürün linkleri gösterilecek"}
          </p>
        </div>

        {/* Liste Linkleri - Sadece showDirectLinks true ise göster */}
        {formData.showDirectLinks && (
        <div>
          <Label>
            Liste Linkleri (E-ticaret) <span className="text-error-500">*</span>
          </Label>
          <div className="space-y-3">
            {formData.listUrls.map((listUrl, index) => (
              <div key={listUrl.id || index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Link #{index + 1}
                  </span>
                  {formData.listUrls.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newListUrls = formData.listUrls.filter((_, i) => i !== index);
                        // Ensure at least one primary if we're removing the primary
                        if (listUrl.isPrimary && newListUrls.length > 0) {
                          newListUrls[0].isPrimary = true;
                        }
                        setFormData({ ...formData, listUrls: newListUrls });
                      }}
                      disabled={loading}
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm">E-ticaret Markası</Label>
                  <div className="relative">
                    <Select
                      options={[
                        { value: "", label: "Marka seçin" },
                        ...brands.map((brand) => ({
                          value: brand.id,
                          label: brand.name,
                        })),
                      ]}
                      value={listUrl.ecommerceBrandId}
                      onChange={(value) => {
                        const newListUrls = [...formData.listUrls];
                        newListUrls[index].ecommerceBrandId = value;
                        setFormData({ ...formData, listUrls: newListUrls });
                      }}
                      placeholder="Marka Seçin"
                      className={loading ? "opacity-50 cursor-not-allowed" : ""}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">URL</Label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={listUrl.url}
                    onChange={(e) => {
                      const newListUrls = [...formData.listUrls];
                      newListUrls[index].url = e.target.value;
                      setFormData({ ...formData, listUrls: newListUrls });
                    }}
                    disabled={loading}
                    required
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={listUrl.isPrimary}
                      onChange={(e) => {
                        const newListUrls = [...formData.listUrls];
                        // Unset other primaries
                        if (e.target.checked) {
                          newListUrls.forEach((lu, i) => {
                            lu.isPrimary = i === index;
                          });
                        } else {
                          newListUrls[index].isPrimary = false;
                        }
                        setFormData({ ...formData, listUrls: newListUrls });
                      }}
                      disabled={loading}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Varsayılan Link
                    </span>
                  </label>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Sıra:</Label>
                    <Input
                      type="number"
                      min="0"
                      value={listUrl.order}
                      onChange={(e) => {
                        const newListUrls = [...formData.listUrls];
                        newListUrls[index].order = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, listUrls: newListUrls });
                      }}
                      disabled={loading}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setFormData({
                  ...formData,
                  listUrls: [
                    ...formData.listUrls,
                    {
                      id: `new-${Date.now()}`,
                      ecommerceBrandId: "",
                      url: "",
                      isPrimary: formData.listUrls.length === 0,
                      order: formData.listUrls.length,
                    },
                  ],
                });
              }}
              disabled={loading}
            >
              + Link Ekle
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Liste için e-ticaret linkleri ekleyin (Amazon, Hepsiburada, vb.)
          </p>
        </div>
        )}

        {/* Ürünler (Linkler) - Sadece showDirectLinks false ise göster */}
        {!formData.showDirectLinks && (
        <div>
          <Label>Ürünler (Linkler)</Label>
          
          {/* Arama ve Filtre Bilgisi */}
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
              {formData.categoryId
                ? "Seçili kategoriye göre filtreleniyor"
                : "Tüm ürünler gösteriliyor"}
              {filteredLinks.length > 0 && ` • ${filteredLinks.length} ürün bulundu`}
            </p>
          </div>

          <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
            {allLinks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Henüz link eklenmemiş. Önce link oluşturun.
              </p>
            ) : filteredLinks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.categoryId
                  ? "Seçilen kategoriye uygun ürün bulunamadı."
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
        )}

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

