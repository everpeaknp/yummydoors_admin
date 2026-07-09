"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder: "promos" | "restaurants" | "menu-items" | "categories" | "general";
  placeholder?: string;
  helperText?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  placeholder = "Upload image",
  helperText,
  className
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder_type", folder);

      const res = await fetch("/api/proxy/media/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.detail || "Upload failed");
      }

      onChange(payload.data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function triggerSelect() {
    fileInputRef.current?.click();
  }

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
      
      {value ? (
        <div className="relative group overflow-hidden rounded-2xl border border-line bg-wash w-full h-48">
          <Image
            fill
            src={value} 
            alt="Uploaded" 
            className="object-contain"
          />
          <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button
              onClick={triggerSelect}
              type="button"
              className="px-4 py-2 bg-white rounded-full text-sm font-medium text-ink hover:bg-gray-100 transition"
            >
              Change
            </button>
            <button
              onClick={() => onChange("")}
              type="button"
              className="p-2 bg-white rounded-full text-ink hover:bg-red-50 hover:text-red-500 transition"
              title="Remove"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerSelect}
          disabled={isUploading}
          className="flex flex-col items-center justify-center gap-3 w-full h-32 rounded-2xl border-2 border-dashed border-line bg-wash hover:bg-white hover:border-primary/50 transition text-mute focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm font-medium">Uploading...</span>
            </>
          ) : (
            <>
              <div className="p-3 bg-white rounded-full shadow-sm border border-line">
                <UploadCloud className="w-6 h-6 text-ink" />
              </div>
              <span className="text-sm font-medium">{placeholder}</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}

      {helperText && (
        <p className="text-xs text-mute mt-1 px-1">{helperText}</p>
      )}
    </div>
  );
}
