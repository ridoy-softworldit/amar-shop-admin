"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud, Trash2 } from "lucide-react";
import {
  getUploadSignature,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/services/uploads";

export type UploadItem = { url: string; publicId: string };

export default function UploadImages({
  label = "Images",
  value,
  onChange,
  disabled,
  max = 8,
}: {
  label?: string;
  value: UploadItem[];
  onChange: (v: UploadItem[]) => void;
  disabled?: boolean;
  max?: number;
}) {
  const [busy, setBusy] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setBusy(true);
    try {
      const sign = await getUploadSignature();
      const next: UploadItem[] = [];
      for (const f of files.slice(0, Math.max(0, max - value.length))) {
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
      // ignore delete error
    }
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((it, i) => (
          <div
            key={`${it.publicId || it.url}-${i}`}
            className="relative h-32 rounded-xl overflow-hidden border-2 border-emerald-200"
          >
            <Image
              src={it.url}
              alt="uploaded"
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
              Remove
            </button>
          </div>
        ))}

        {value.length < max && (
          <label className="flex items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-emerald-50/40 border-emerald-200 text-emerald-700">
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
                {busy ? "Uploading..." : "Add images"}
              </span>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}
