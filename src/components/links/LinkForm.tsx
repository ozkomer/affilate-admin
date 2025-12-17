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

interface ProductUrl {
  id?: string;
  ecommerceBrandId: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

interface LinkFormProps {
  linkId?: string;
  initialData?: {
    title: string;
    originalUrl?: string;
    description: string | null;
    categoryId: string | null;
    ecommerceBrandId?: string | null;
    customSlug: string | null;
    tags: string[];
    isActive: boolean;
    imageUrl: string | null;
    youtubeUrl?: string | null;
    productUrls?: ProductUrl[];
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
    description: initialData?.description || "",
    customSlug: initialData?.customSlug || "",
    tags: initialData?.tags?.join(", ") || "",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    imageUrl: initialData?.imageUrl || "",
    youtubeUrl: initialData?.youtubeUrl || "",
    listIds: [] as string[],
    productUrls: (initialData?.productUrls && initialData.productUrls.length > 0 
      ? initialData.productUrls.map(pu => ({
          id: pu.id,
          ecommerceBrandId: pu.ecommerceBrandId,
          url: pu.url,
          isPrimary: pu.isPrimary,
          order: pu.order,
        }))
      : (initialData?.originalUrl && initialData?.ecommerceBrandId
          ? [{ id: `old-${Date.now()}`, ecommerceBrandId: initialData.ecommerceBrandId, url: initialData.originalUrl, isPrimary: true, order: 0 }]
          : [{ ecommerceBrandId: "", url: "", isPrimary: true, order: 0 }]
        )
    ) as ProductUrl[],
  });

  useEffect(() => {
    fetchLists();
    fetchBrands();
    if (linkId && !initialData) {
      fetchLink();
    }
  }, [linkId]);

  // Marka değiştiğinde arama sonuçlarını temizle - Artık kullanılmıyor
  // useEffect(() => {
  //   setSearchResults([]);
  //   setSearchQuery("");
  // }, [formData.ecommerceBrandId]);

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
        let linkLists: string[] = [];
        if (listsResponse.ok) {
          const allLists = await listsResponse.json();
          linkLists = allLists
            .filter((list: any) => 
              list.links?.some((linkItem: any) => linkItem.linkId === linkId)
            )
            .map((list: any) => list.id);
        }
        
        // Handle productUrls
        let productUrlsData: ProductUrl[] = [];
        if (data.productUrls && data.productUrls.length > 0) {
          productUrlsData = data.productUrls.map((pu: any) => ({
            id: pu.id,
            ecommerceBrandId: pu.ecommerceBrandId,
            url: pu.url,
            isPrimary: pu.isPrimary || false,
            order: pu.order || 0,
          }));
        } else if (data.originalUrl && data.ecommerceBrandId) {
          // Fallback for old structure
          productUrlsData = [{
            id: `old-${Date.now()}`,
            ecommerceBrandId: data.ecommerceBrandId,
            url: data.originalUrl,
            isPrimary: true,
            order: 0,
          }];
        } else {
          productUrlsData = [{
            ecommerceBrandId: "",
            url: "",
            isPrimary: true,
            order: 0,
          }];
        }
        
        setFormData({
          title: data.title,
          description: data.description || "",
          customSlug: data.customSlug || "",
          tags: data.tags?.join(", ") || "",
          isActive: data.isActive,
          imageUrl: data.imageUrl || "",
          youtubeUrl: data.youtubeUrl || "",
          listIds: linkLists,
          productUrls: productUrlsData,
        });
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

      // Validate productUrls
      const validProductUrls = formData.productUrls.filter(pu => 
        pu.ecommerceBrandId && pu.ecommerceBrandId.trim() !== '' && pu.url && pu.url.trim() !== ''
      );
      
      if (validProductUrls.length === 0) {
        alert("En az bir geçerli e-ticaret linki eklemelisiniz (marka ve URL ile)");
        setLoading(false);
        return;
      }

      const payload: any = {
        title: formData.title,
        description: formData.description || null,
        customSlug: formData.customSlug || null,
        tags: tagsArray,
        isActive: formData.isActive,
        imageUrl: formData.imageUrl || null,
        youtubeUrl: formData.youtubeUrl || null,
        listIds: formData.listIds,
        productUrls: validProductUrls.map(pu => ({
          ecommerceBrandId: pu.ecommerceBrandId,
          url: pu.url,
          isPrimary: pu.isPrimary,
          order: pu.order,
        })),
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

  // Ürün arama fonksiyonları kaldırıldı - artık çoklu link desteği var

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
          <Label>
            E-ticaret Linkleri <span className="text-error-500">*</span>
          </Label>
          <div className="space-y-3">
            {formData.productUrls.map((productUrl, index) => (
              <div key={productUrl.id || index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Link #{index + 1}
                  </span>
                  {formData.productUrls.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newProductUrls = formData.productUrls.filter((_, i) => i !== index);
                        // Ensure at least one primary if we're removing the primary
                        if (productUrl.isPrimary && newProductUrls.length > 0) {
                          newProductUrls[0].isPrimary = true;
                        }
                        setFormData({ ...formData, productUrls: newProductUrls });
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
                        ...brandOptions,
                      ]}
                      placeholder="Marka seçin"
                      onChange={(value) => {
                        const newProductUrls = [...formData.productUrls];
                        newProductUrls[index].ecommerceBrandId = value;
                        setFormData({ ...formData, productUrls: newProductUrls });
                      }}
                      className="dark:bg-dark-900"
                      value={productUrl.ecommerceBrandId}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">URL</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com/affiliate-link"
                    value={productUrl.url}
                    onChange={(e) => {
                      const newProductUrls = [...formData.productUrls];
                      newProductUrls[index].url = e.target.value;
                      setFormData({ ...formData, productUrls: newProductUrls });
                    }}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`isPrimary-${index}`}
                    checked={productUrl.isPrimary}
                    onChange={(e) => {
                      const newProductUrls = [...formData.productUrls];
                      // If setting this as primary, unset others
                      if (e.target.checked) {
                        newProductUrls.forEach((pu, i) => {
                          pu.isPrimary = i === index;
                        });
                      } else {
                        newProductUrls[index].isPrimary = false;
                        // Set first one as primary if none is primary
                        if (!newProductUrls.some(pu => pu.isPrimary) && newProductUrls.length > 0) {
                          newProductUrls[0].isPrimary = true;
                        }
                      }
                      setFormData({ ...formData, productUrls: newProductUrls });
                    }}
                    disabled={loading}
                    className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600"
                  />
                  <Label htmlFor={`isPrimary-${index}`} className="cursor-pointer text-sm">
                    Varsayılan link
                  </Label>
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
                  productUrls: [
                    ...formData.productUrls,
                    { ecommerceBrandId: "", url: "", isPrimary: false, order: formData.productUrls.length },
                  ],
                });
              }}
              disabled={loading}
            >
              + Yeni Link Ekle
            </Button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ürün için birden fazla e-ticaret sitesinde satış linki ekleyebilirsiniz
          </p>
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

