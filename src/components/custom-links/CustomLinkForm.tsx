"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";

interface CustomLinkFormProps {
  linkId?: string;
}

export default function CustomLinkForm({ linkId }: CustomLinkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    targetUrl: "",
    shortUrl: "",
    description: "",
    tags: "",
    notes: "",
    isActive: true,
  });

  useEffect(() => {
    if (linkId) {
      fetchLink();
    }
  }, [linkId]);

  const fetchLink = async () => {
    try {
      setDataLoading(true);
      const response = await fetch(`/api/custom-links/${linkId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || "",
          targetUrl: data.targetUrl || "",
          shortUrl: data.shortUrl || "",
          description: data.description || "",
          tags: data.tags?.join(", ") || "",
          notes: data.notes || "",
          isActive: data.isActive !== undefined ? data.isActive : true,
        });
      }
    } catch (error) {
      console.error("Error fetching link:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : [],
      };

      const url = linkId
        ? `/api/custom-links/${linkId}`
        : "/api/custom-links";
      const method = linkId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/custom-links");
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

  if (dataLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Başlık *</Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Link başlığı"
          required
        />
      </div>

      <div>
        <Label htmlFor="targetUrl">Hedef URL *</Label>
        <Input
          id="targetUrl"
          type="url"
          value={formData.targetUrl}
          onChange={(e) =>
            setFormData({ ...formData, targetUrl: e.target.value })
          }
          placeholder="https://example.com"
          required
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kullanıcılar bu URL'e yönlendirilecek
        </p>
      </div>

      <div>
        <Label htmlFor="shortUrl">Kısa URL *</Label>
        <Input
          id="shortUrl"
          type="text"
          value={formData.shortUrl}
          onChange={(e) =>
            setFormData({ ...formData, shortUrl: e.target.value })
          }
          placeholder="ornek-link"
          required
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          eneso.cc/{formData.shortUrl || "ornek-link"}
        </p>
      </div>

      <div>
        <Label htmlFor="description">Açıklama</Label>
        <TextArea
          value={formData.description}
          onChange={(value) =>
            setFormData({ ...formData, description: value })
          }
          placeholder="Link açıklaması (opsiyonel)"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="tags">Etiketler</Label>
        <Input
          id="tags"
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="etiket1, etiket2, etiket3"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Virgülle ayrılmış etiketler
        </p>
      </div>

      <div>
        <Label htmlFor="notes">Notlar</Label>
        <TextArea
          value={formData.notes}
          onChange={(value) => setFormData({ ...formData, notes: value })}
          placeholder="İç notlar (opsiyonel)"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
        />
        <Label htmlFor="isActive" className="mb-0">
          Aktif
        </Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : linkId ? "Güncelle" : "Oluştur"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/custom-links")}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}

