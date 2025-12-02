"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud, Trash2 } from "lucide-react";
import {
  getUploadSignature,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/services/uploads";

export type UploadValue = {
  url: string;
  publicId: string;
} | null;

export default function UploadImage({
  label = "Image",
  value,
  onChange,
  disabled,
}: {
  label?: string;
  value: UploadValue;
  onChange: (v: UploadValue) => void;
  disabled?: boolean;
}) {

  const [busy, setBusy] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBusy(true);
      const sign = await getUploadSignature();
      const up = await uploadToCloudinary(file, sign);
      onChange({ url: up.secure_url, publicId: up.public_id });
    } catch {
      alert("Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    if (!value?.publicId) {
      onChange(null);
      return;
    }
    try {
      setBusy(true);
      await deleteFromCloudinary(value.publicId);
      onChange(null);
    } catch {
      alert("Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>

      {!value ? (
        <label className="flex items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-rose-50 border-rose-300 text-rose-600">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
            disabled={disabled || busy}
          />
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="w-6 h-6" />
            <span className="text-sm font-medium">
              {busy ? "Uploading..." : "Click to choose image"}
            </span>
          </div>
        </label>
      ) : (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-rose-200">
          <Image src={value.url} alt="uploaded" fill className="object-cover" />
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled || busy}
            className="absolute top-2 right-2 inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
