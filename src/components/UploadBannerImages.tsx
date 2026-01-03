"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud, Trash2 } from "lucide-react";
import {
  getUploadSignature,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/services/uploads";

export type BannerImage = { url: string; publicId: string };

export default function UploadBannerImages({
  label = "Max 3 Banner Image - (16:9 ratio) 1280px*720px or 1920px*1080px",
  value,
  onChange,
  disabled,
}: {
  label?: string;
  value: BannerImage[];
  onChange: (v: BannerImage[]) => void;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setBusy(true);
    try {
      const sign = await getUploadSignature();
      const next: BannerImage[] = [];
      for (const f of files.slice(0, Math.max(0, 3 - value.length))) {
        const up = await uploadToCloudinary(f, sign);
        next.push({ url: up.secure_url, publicId: up.public_id });
      }
      onChange([...value, ...next]);
    } finally {
      setBusy(false);
      e.currentTarget.value = "";
    }
  };

  const removeAt = async (idx: number) => {
    const it = value[idx];
    try {
      if (it?.publicId) await deleteFromCloudinary(it.publicId);
    } catch {
      // ignore
    }
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="grid grid-cols-3 gap-3">
        {value.map((it, i) => (
          <div
            key={`${it.publicId || it.url}-${i}`}
            className="relative h-32 rounded-xl overflow-hidden border-2 border-pink-200"
          >
            <Image
              src={it.url}
              alt={`Banner ${i + 1}`}
              fill
              className="object-cover"
              sizes="200px"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              disabled={disabled || busy}
              className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-semibold">
              Banner {i + 1}
            </div>
          </div>
        ))}

        {value.length < 3 && (
          <label className="flex items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-pink-50/40 border-pink-300 text-pink-600">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPick}
              disabled={disabled || busy}
            />
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="w-6 h-6" />
              <span className="text-sm font-medium">
                {busy ? "Uploading..." : "Add Banner"}
              </span>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}
