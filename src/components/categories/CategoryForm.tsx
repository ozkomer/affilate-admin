"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import ImageUpload from "@/components/form/ImageUpload";

interface CategoryFormProps {
  categoryId?: string;
  initialData?: {
    name: string;
    description: string | null;
    color: string | null;
    imageUrl: string | null;
  };
}

export default function CategoryForm({
  categoryId,
  initialData,
}: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true); // New state for initial data loading
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    color: initialData?.color || "#3B82F6",
    imageUrl: initialData?.imageUrl || "",
  });

  useEffect(() => {
    if (categoryId && !initialData) {
      fetchCategory();
    } else {
      setDataLoading(false);
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setDataLoading(true);
      const response = await fetch(`/api/categories/${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name,
          description: data.description || "",
          color: data.color || "#3B82F6",
          imageUrl: data.imageUrl || "",
        });
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        color: formData.color || null,
        imageUrl: formData.imageUrl || null,
      };

      const url = categoryId ? `/api/categories/${categoryId}` : "/api/categories";
      const method = categoryId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/categories");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Bir hata oluştu");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Kategori kaydedilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while data is being fetched
  if (dataLoading && categoryId && !initialData) {
    return (
      <ComponentCard title={categoryId ? "Kategori Düzenle" : "Yeni Kategori Oluştur"}>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title={categoryId ? "Kategori Düzenle" : "Yeni Kategori Oluştur"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>
            Kategori Adı <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="Kategori adı"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label>Açıklama</Label>
          <TextArea
            placeholder="Kategori hakkında açıklama (opsiyonel)"
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
            label="Kategori Avatarı"
            value={formData.imageUrl}
            onChange={(url) =>
              setFormData({ ...formData, imageUrl: url })
            }
            bucket="category-avatars"
            folder="avatars"
            disabled={loading}
            maxSizeMB={2}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Kategori için avatar resmi yükleyin (opsiyonel, max 2MB)
          </p>
        </div>

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
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Kategori için bir renk seçin (hex formatında)
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" size="sm" disabled={loading}>
            {loading
              ? "Kaydediliyor..."
              : categoryId
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

