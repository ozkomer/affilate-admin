"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Switch from "@/components/form/switch/Switch";

interface BrandFormProps {
  brandId?: string;
  initialData?: {
    name: string;
    slug: string;
    logo: string | null;
    color: string | null;
    website: string | null;
    description: string | null;
    isActive: boolean;
  };
}

export default function BrandForm({
  brandId,
  initialData,
}: BrandFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    logo: initialData?.logo || "",
    color: initialData?.color || "#3B82F6",
    website: initialData?.website || "",
    description: initialData?.description || "",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  useEffect(() => {
    if (brandId && !initialData) {
      fetchBrand();
    }
  }, [brandId]);

  const fetchBrand = async () => {
    try {
      const response = await fetch(`/api/brands/${brandId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name,
          slug: data.slug,
          logo: data.logo || "",
          color: data.color || "#3B82F6",
          website: data.website || "",
          description: data.description || "",
          isActive: data.isActive,
        });
      }
    } catch (error) {
      console.error("Error fetching brand:", error);
    }
  };

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (value: string) => {
    // Auto-generate slug if it's empty or matches the old name
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        name: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        logo: formData.logo || null,
        color: formData.color || null,
        website: formData.website || null,
        description: formData.description || null,
        isActive: formData.isActive,
      };

      const url = brandId ? `/api/brands/${brandId}` : "/api/brands";
      const method = brandId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/brands");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Bir hata oluştu");
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      alert("Marka kaydedilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title={brandId ? "Marka Düzenle" : "Yeni Marka Oluştur"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>
            Marka Adı <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="Örn: N11, Trendyol, Hepsiburada, Amazon"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label>
            Slug <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="n11, trendyol, hepsiburada, amazon"
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value.toLowerCase() })
            }
            required
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            URL'de kullanılacak kısa isim (küçük harf, tire ile ayrılmış)
          </p>
        </div>

        <div>
          <Label>Logo URL</Label>
          <Input
            type="url"
            placeholder="https://example.com/logo.png"
            value={formData.logo}
            onChange={(e) =>
              setFormData({ ...formData, logo: e.target.value })
            }
            disabled={loading}
          />
          {formData.logo && (
            <div className="mt-2">
              <img
                src={formData.logo}
                alt="Logo preview"
                className="w-16 h-16 object-contain border border-gray-200 dark:border-gray-700 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Renk</Label>
            <div className="flex items-center gap-4">
              <Input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                disabled={loading}
                className="w-20 h-11 cursor-pointer"
              />
              <Input
                type="text"
                placeholder="#3B82F6"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                disabled={loading}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Website</Label>
            <Input
              type="url"
              placeholder="https://www.example.com"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <Label>Açıklama</Label>
          <TextArea
            placeholder="Marka hakkında açıklama (opsiyonel)"
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3">
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
              Marka aktif
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" size="sm" disabled={loading}>
            {loading
              ? "Kaydediliyor..."
              : brandId
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

