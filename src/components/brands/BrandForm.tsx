"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Switch from "@/components/form/switch/Switch";
import { validateFileSize, validateImageType } from "@/lib/supabase/storage";

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
  const [uploading, setUploading] = useState(false);
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

  // Logo upload handler
  const handleLogoUpload = async (file: File) => {
    if (!validateImageType(file)) {
      alert("Sadece resim dosyaları yüklenebilir (PNG, JPG, WebP, GIF, SVG)");
      return;
    }

    if (!validateFileSize(file, 5)) {
      alert("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.slug || 'brand'}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Create form data for API
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('bucket', 'brand-logos');
      uploadFormData.append('path', filePath);

      // Upload via API endpoint (bypasses RLS)
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Logo yüklenirken hata oluştu: ${result.error}`);
        return;
      }

      if (result.url) {
        setFormData((prev) => ({
          ...prev,
          logo: result.url,
        }));
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Logo yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleLogoUpload(acceptedFiles[0]);
      }
    },
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/gif": [],
      "image/svg+xml": [],
    },
    maxFiles: 1,
    disabled: uploading || loading,
  });

  // Remove logo
  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logo: "",
    }));
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
          <Label>Logo</Label>
          
          {/* Logo Preview */}
          {formData.logo && (
            <div className="mb-4 flex items-center gap-4">
              <div className="relative">
                <img
                  src={formData.logo}
                  alt="Logo preview"
                  className="w-24 h-24 object-contain border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemoveLogo}
                disabled={uploading || loading}
              >
                Logoyu Kaldır
              </Button>
            </div>
          )}

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
              isDragActive
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-300 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-600 bg-gray-50 dark:bg-gray-900"
            } ${uploading || loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center">
              {uploading ? (
                <>
                  <div className="mb-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Logo yükleniyor...
                  </p>
                </>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {isDragActive
                      ? "Dosyayı buraya bırakın"
                      : "Logo yüklemek için tıklayın veya sürükleyip bırakın"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG, WebP, GIF, SVG (Max 5MB)
                  </p>
                </>
              )}
            </div>
          </div>
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

