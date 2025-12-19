"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import ImageUpload from "@/components/form/ImageUpload";

interface UserProfile {
  id?: string;
  name: string;
  bio: string | null;
  profileImageUrl: string | null;
  attentionText: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  whatsappUrl: string | null;
  telegramUrl: string | null;
}

export default function ProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    bio: "",
    profileImageUrl: "",
    attentionText: "",
    instagramUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    whatsappUrl: "",
    telegramUrl: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          profileImageUrl: data.profileImageUrl || "",
          attentionText: data.attentionText || "",
          instagramUrl: data.instagramUrl || "",
          youtubeUrl: data.youtubeUrl || "",
          tiktokUrl: data.tiktokUrl || "",
          whatsappUrl: data.whatsappUrl || "",
          telegramUrl: data.telegramUrl || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio || null,
          profileImageUrl: formData.profileImageUrl || null,
          attentionText: formData.attentionText || null,
          instagramUrl: formData.instagramUrl || null,
          youtubeUrl: formData.youtubeUrl || null,
          tiktokUrl: formData.tiktokUrl || null,
          whatsappUrl: formData.whatsappUrl || null,
          telegramUrl: formData.telegramUrl || null,
        }),
      });

      if (response.ok) {
        alert("Profil başarıyla güncellendi!");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Bir hata oluştu");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Profil güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <ComponentCard title="Profil Bilgilerini Düzenle">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>
            Ad Soyad <span className="text-error-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="Ad Soyad"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label>Biyografi</Label>
          <TextArea
            placeholder="Profil açıklaması"
            value={formData.bio || ""}
            onChange={(value) =>
              setFormData({ ...formData, bio: value })
            }
            disabled={loading}
            rows={3}
          />
        </div>

        <div>
          <ImageUpload
            label="Profil Resmi"
            value={formData.profileImageUrl || ""}
            onChange={(url) =>
              setFormData({ ...formData, profileImageUrl: url })
            }
            bucket="profile-images"
            folder="avatars"
            disabled={loading}
            maxSizeMB={5}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Profil resmi yükleyin (opsiyonel, max 5MB)
          </p>
        </div>

        <div>
          <Label>Dikkat Metni</Label>
          <TextArea
            placeholder="Turuncu animasyonlu dikkat metni"
            value={formData.attentionText || ""}
            onChange={(value) =>
              setFormData({ ...formData, attentionText: value })
            }
            disabled={loading}
            rows={2}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ana sayfada turuncu renkte gösterilecek metin
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sosyal Medya Linkleri
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label>Instagram URL</Label>
              <Input
                type="url"
                placeholder="https://instagram.com/kullaniciadi"
                value={formData.instagramUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, instagramUrl: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div>
              <Label>YouTube URL</Label>
              <Input
                type="url"
                placeholder="https://youtube.com/@kanaladi"
                value={formData.youtubeUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, youtubeUrl: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div>
              <Label>TikTok URL</Label>
              <Input
                type="url"
                placeholder="https://tiktok.com/@kullaniciadi"
                value={formData.tiktokUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tiktokUrl: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            İndirim Kanalları
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label>WhatsApp URL</Label>
              <Input
                type="url"
                placeholder="https://wa.me/905551234567"
                value={formData.whatsappUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, whatsappUrl: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div>
              <Label>Telegram URL</Label>
              <Input
                type="url"
                placeholder="https://t.me/kanaladi"
                value={formData.telegramUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, telegramUrl: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}




