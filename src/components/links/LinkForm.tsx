"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import MultiSelect from "@/components/form/MultiSelect";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import ImageUpload from "@/components/form/ImageUpload";
import { ChevronDownIcon } from "@/icons";

interface CuratedList {
  id: string;
  title: string;
  slug: string;
}

interface EcommerceBrand {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  logo: string | null;
}

interface LinkFormProps {
  linkId?: string;
  initialData?: {
    title: string;
    originalUrl: string;
    description: string | null;
    categoryId: string | null;
    ecommerceBrandId: string | null;
    customSlug: string | null;
    tags: string[];
    isActive: boolean;
    imageUrl: string | null;
  };
}

export default function LinkForm({ linkId, initialData }: LinkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<CuratedList[]>([]);
  const [brands, setBrands] = useState<EcommerceBrand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    originalUrl: initialData?.originalUrl || "",
    description: initialData?.description || "",
    ecommerceBrandId: initialData?.ecommerceBrandId || "",
    customSlug: initialData?.customSlug || "",
    tags: initialData?.tags?.join(", ") || "",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    imageUrl: initialData?.imageUrl || "",
    youtubeUrl: "",
    listIds: [] as string[],
  });

  useEffect(() => {
    fetchLists();
    fetchBrands();
    if (linkId && !initialData) {
      fetchLink();
    }
  }, [linkId]);

  // Marka değiştiğinde arama sonuçlarını temizle
  useEffect(() => {
    setSearchResults([]);
    setSearchQuery("");
  }, [formData.ecommerceBrandId]);

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/lists");
      if (response.ok) {
        const data = await response.json();
        setLists(data);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
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

  const fetchLink = async () => {
    try {
      const response = await fetch(`/api/links/${linkId}`);
      if (response.ok) {
        const data = await response.json();
        // Get lists that contain this link
        const listsResponse = await fetch("/api/lists");
        if (listsResponse.ok) {
          const allLists = await listsResponse.json();
          const linkLists = allLists
            .filter((list: any) => 
              list.links?.some((linkItem: any) => linkItem.linkId === linkId)
            )
            .map((list: any) => list.id);
          
          setFormData({
            title: data.title,
            originalUrl: data.originalUrl,
            description: data.description || "",
            ecommerceBrandId: data.ecommerceBrandId || "",
            customSlug: data.customSlug || "",
            tags: data.tags?.join(", ") || "",
            isActive: data.isActive,
            imageUrl: data.imageUrl || "",
            youtubeUrl: data.youtubeUrl || "",
            listIds: linkLists,
          });
        } else {
          setFormData({
            title: data.title,
            originalUrl: data.originalUrl,
            description: data.description || "",
            ecommerceBrandId: data.ecommerceBrandId || "",
            customSlug: data.customSlug || "",
            tags: data.tags?.join(", ") || "",
            isActive: data.isActive,
            imageUrl: data.imageUrl || "",
            youtubeUrl: data.youtubeUrl || "",
            listIds: [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching link:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const payload: any = {
        title: formData.title,
        originalUrl: formData.originalUrl,
        description: formData.description || null,
        ecommerceBrandId: formData.ecommerceBrandId || null,
        customSlug: formData.customSlug || null,
        tags: tagsArray,
        isActive: formData.isActive,
        imageUrl: formData.imageUrl || null,
        youtubeUrl: formData.youtubeUrl || null,
        listIds: formData.listIds,
      };
      
      // Don't send categoryId since it's removed from the form

      const url = linkId ? `/api/links/${linkId}` : "/api/links";
      const method = linkId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/links");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Bir hata oluştu");
      }
    } catch (error) {
      console.error("Error saving link:", error);
      alert("Link kaydedilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const brandOptions = brands.map((brand) => ({
    value: brand.id,
    label: brand.name,
  }));

  const listOptions = lists.map((list) => ({
    value: list.id,
    text: list.title,
    selected: formData.listIds.includes(list.id),
  }));

  const searchProducts = async () => {
    if (!formData.ecommerceBrandId || !searchQuery.trim()) {
      return;
    }

    setSearching(true);
    try {
      // E-ticaret markasına göre arama yap
      const brand = brands.find((b) => b.id === formData.ecommerceBrandId);
      if (!brand) {
        setSearching(false);
        return;
      }

      // Burada e-ticaret API'lerine istek atılabilir
      // Şimdilik basit bir örnek gösteriyoruz
      // Gerçek implementasyon için e-ticaret API'lerine entegre edilmeli
      
      // Örnek: Trendyol API, N11 API, Hepsiburada API, Amazon API
      // Bu API'ler genellikle API key gerektirir
      
      // Şimdilik kullanıcıya manuel URL girmesi için yardımcı oluyoruz
      alert(`${brand.name} için "${searchQuery}" araması yapılacak. Bu özellik e-ticaret API entegrasyonu gerektirir.`);
      
      // TODO: E-ticaret API entegrasyonu
      // const response = await fetch(`/api/search-products?brand=${brand.slug}&category=${formData.categoryId}&q=${encodeURIComponent(searchQuery)}`);
      // if (response.ok) {
      //   const data = await response.json();
      //   setSearchResults(data);
      // }
    } catch (error) {
      console.error("Error searching products:", error);
      alert("Ürün arama sırasında bir hata oluştu");
    } finally {
      setSearching(false);
    }
  };

  const handleProductSelect = (product: any) => {
    setFormData({
      ...formData,
      title: product.title || formData.title,
      originalUrl: product.url || formData.originalUrl,
      description: product.description || formData.description,
      imageUrl: product.imageUrl || formData.imageUrl,
    });
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <ComponentCard title={linkId ? "Link Düzenle" : "Yeni Link Oluştur"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>
            Başlık <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="Link başlığı"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label>
            Orijinal URL <span className="text-error-500">*</span>
          </Label>
          <Input
            type="url"
            placeholder="https://example.com/affiliate-link"
            value={formData.originalUrl}
            onChange={(e) =>
              setFormData({ ...formData, originalUrl: e.target.value })
            }
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label>Açıklama</Label>
          <TextArea
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
            label="Ürün Resmi"
            value={formData.imageUrl}
            onChange={(url) =>
              setFormData({ ...formData, imageUrl: url })
            }
            bucket="product-images"
            folder="images"
            disabled={loading}
            maxSizeMB={5}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ürün için resim yükleyin (opsiyonel, max 5MB)
          </p>
        </div>

        <div>
          <Label>E-ticaret Markası</Label>
          <div className="relative">
            <Select
              options={[
                { value: "", label: "Marka seçin" },
                ...brandOptions,
              ]}
              placeholder="Marka seçin"
              onChange={(value) =>
                setFormData({ ...formData, ecommerceBrandId: value })
              }
              className="dark:bg-dark-900"
              value={formData.ecommerceBrandId}
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        <div>
          <Label>Listelere Ekle</Label>
          <MultiSelect
            label=""
            options={listOptions}
            defaultSelected={formData.listIds}
            onChange={(values) =>
              setFormData({ ...formData, listIds: values })
            }
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Bu ürünü eklemek istediğiniz listeleri seçin
          </p>
        </div>

        <div>
          <Label>YouTube Linki</Label>
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={formData.youtubeUrl}
            onChange={(e) =>
              setFormData({ ...formData, youtubeUrl: e.target.value })
            }
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ürün ile ilgili YouTube video linki (opsiyonel)
          </p>
        </div>

        {/* Ürün Arama Bölümü */}
        {formData.ecommerceBrandId && (
          <div>
            <Label>Ürün Ara</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ürün adı veya URL girin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    searchProducts();
                  }
                }}
                disabled={loading || searching}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={searchProducts}
                disabled={loading || searching || !searchQuery.trim()}
              >
                {searching ? "Aranıyor..." : "Ara"}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              E-ticaret markası ve kategori seçtikten sonra ürün arayabilirsiniz
            </p>

            {/* Arama Sonuçları */}
            {searchResults.length > 0 && (
              <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Arama Sonuçları
                </h4>
                <div className="space-y-2">
                  {searchResults.map((product, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-start gap-3">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {product.title}
                          </h5>
                          {product.price && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {product.price}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <Label>Özel Slug (Opsiyonel)</Label>
            <Input
              type="text"
              placeholder="ozel-link-adi"
              value={formData.customSlug}
              onChange={(e) =>
                setFormData({ ...formData, customSlug: e.target.value })
              }
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Boş bırakılırsa otomatik oluşturulur
            </p>
        </div>

        <div>
          <Label>Etiketler</Label>
          <Input
            type="text"
            placeholder="etiket1, etiket2, etiket3"
            value={formData.tags}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value })
            }
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Etiketleri virgülle ayırın
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            disabled={loading}
            className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600"
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Link aktif
          </Label>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" size="sm" disabled={loading}>
            {loading
              ? "Kaydediliyor..."
              : linkId
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

