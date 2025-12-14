"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import Label from "./Label";
import { validateFileSize, validateImageType } from "@/lib/supabase/storage";

interface ImageUploadProps {
  label?: string;
  value?: string; // Mevcut resim URL'i
  onChange: (url: string) => void;
  bucket?: string; // Supabase bucket adı
  folder?: string; // Klasör adı
  disabled?: boolean;
  maxSizeMB?: number;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  bucket = "uploads",
  folder = "images",
  disabled = false,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validasyon
      if (!validateImageType(file)) {
        setError("Sadece resim dosyaları yüklenebilir (JPG, PNG, WebP, GIF)");
        return;
      }

      if (!validateFileSize(file, maxSizeMB)) {
        setError(`Dosya boyutu ${maxSizeMB}MB'dan küçük olmalıdır`);
        return;
      }

      setError(null);
      setUploading(true);

      try {
        // Preview oluştur
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        // FormData oluştur
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", bucket);
        formData.append("folder", folder);

        // API'ye yükle
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.details 
            ? `${data.error}: ${data.details}` 
            : data.error || "Yükleme başarısız";
          throw new Error(errorMessage);
        }

        // Başarılı - URL'i parent'a gönder
        onChange(data.url);
        setError(null);
      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Yükleme başarısız");
        setPreview(value || null); // Önceki resme geri dön
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, maxSizeMB, onChange, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    disabled: disabled || uploading,
  });

  const handleRemove = () => {
    setPreview(null);
    onChange("");
  };

  return (
    <div>
      {label && <Label>{label}</Label>}
      
      {preview ? (
        <div className="relative w-full">
          <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
              >
                Kaldır
              </button>
            )}
          </div>
          {uploading && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Yükleniyor...
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900"
          } ${disabled || uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center">
            <svg
              className="mb-4 h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              {isDragActive
                ? "Dosyayı buraya bırakın"
                : "Resmi sürükleyip bırakın veya tıklayın"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              PNG, JPG, WebP, GIF (Max {maxSizeMB}MB)
            </p>
            {uploading && (
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Yükleniyor...
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {value && !preview && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Mevcut resim: {value}
        </div>
      )}
    </div>
  );
}

