"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { ChevronDownIcon } from "@/icons";

interface Category {
  id: string;
  name: string;
  color: string | null;
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
  };
}

export default function LinkForm({ linkId, initialData }: LinkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<EcommerceBrand[]>([]);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    originalUrl: initialData?.originalUrl || "",
    description: initialData?.description || "",
    categoryId: initialData?.categoryId || "",
    ecommerceBrandId: initialData?.ecommerceBrandId || "",
    customSlug: initialData?.customSlug || "",
    tags: initialData?.tags?.join(", ") || "",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    if (linkId && !initialData) {
      fetchLink();
    }
  }, [linkId]);

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

  const fetchLink = async () => {
    try {
      const response = await fetch(`/api/links/${linkId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title,
          originalUrl: data.originalUrl,
          description: data.description || "",
          categoryId: data.categoryId || "",
          ecommerceBrandId: data.ecommerceBrandId || "",
          customSlug: data.customSlug || "",
          tags: data.tags?.join(", ") || "",
          isActive: data.isActive,
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

      const payload = {
        title: formData.title,
        originalUrl: formData.originalUrl,
        description: formData.description || null,
        categoryId: formData.categoryId || null,
        ecommerceBrandId: formData.ecommerceBrandId || null,
        customSlug: formData.customSlug || null,
        tags: tagsArray,
        isActive: formData.isActive,
      };

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

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const brandOptions = brands.map((brand) => ({
    value: brand.id,
    label: brand.name,
  }));

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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
            <Label>Kategori</Label>
            <div className="relative">
              <Select
                options={[
                  { value: "", label: "Kategori seçin" },
                  ...categoryOptions,
                ]}
                placeholder="Kategori seçin"
                onChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
                className="dark:bg-dark-900"
                value={formData.categoryId}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
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

