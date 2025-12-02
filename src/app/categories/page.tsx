/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  FolderHeart,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/services/categories.api";
import type {
  Category as AdminCategory,
  CreateCategoryDTO,
} from "@/types/category";
import { isActive } from "@/types/category";
import UploadImage, { UploadValue } from "@/components/UploadImage";


/** ---------- Runtime helpers: handle name/title mixed shapes ---------- */
type AnyCategory = AdminCategory & { title?: string }; // API কিছু ক্ষেত্রে title দিচ্ছে
const getName = (c: AnyCategory) => (c.name ?? c.title ?? "").trim();
const getSlug = (c: AnyCategory) => (c.slug ?? "").trim();
const getDesc = (c: AnyCategory) => (c.description ?? "").trim();

function safeLower(s?: string) {
  return (s ?? "").toLowerCase();
}

function ConfirmDialog({
  open,
  title,
  subtitle,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-pink-200 shadow-2xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-3 p-6 pt-0 flex-col sm:flex-row">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-5 py-2.5 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<AnyCategory | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
    isActive: true,
  });

  const { data, isLoading, isFetching, error } = useListCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const categories = useMemo<AnyCategory[]>(
    () => ((data as any)?.data ?? []) as AnyCategory[],
    [data]
  );

  const filtered = useMemo(() => {
    const q = safeLower(searchQuery);
    return categories.filter((c) => {
      const nameLower = safeLower(getName(c));
      const slugLower = safeLower(getSlug(c));
      const descLower = safeLower(getDesc(c));
      return (
        nameLower.includes(q) ||
        slugLower.includes(q) ||
        (descLower.includes(q) ?? false)
      );
    });
  }, [categories, searchQuery]);

  const openModal = (cat?: AnyCategory) => {
    if (cat) {
      const n = getName(cat);
      setEditing(cat);
      setFormData({
        name: n,
        slug:
          getSlug(cat) ||
          n
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        image: cat.image || "",
        description: getDesc(cat),
        isActive: isActive(cat),
      });
    } else {
      setEditing(null);
      setFormData({
        name: "",
        slug: "",
        image: "",
        description: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  const handleNameChange = (name: string) => {
    const safe = name ?? "";
    setFormData((s) => ({
      ...s,
      name: safe,
      slug: safe
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateCategoryDTO = {
      name: formData.name, 
      slug: formData.slug,
      image: formData.image || undefined,
      description: formData.description || undefined,
      status: formData.isActive ? "ACTIVE" : "HIDDEN",
    };

    try {
      if (editing) {
        await updateCategory({
          id: (editing as any)._id,
          body: payload,
        }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory(payload).unwrap();
        toast.success("Category created successfully");
      }
      closeModal();
    } catch {
      toast.error("Operation failed");
    }
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteCategory(confirmId).unwrap();
      toast.success("Category deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setConfirmId(null);
    }
  };

  const isValidImageUrl = (url?: string) => {
    if (!url) return false;
    try {
      const u = new URL(
        url,
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost"
      );
      return ["http:", "https:"].includes(u.protocol) || url.startsWith("/");
    } catch {
      return false;
    }
  };

  const Skeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-40 bg-pink-100/60" />
      <div className="p-5 space-y-2">
        <div className="h-4 bg-pink-100 rounded w-3/4" />
        <div className="h-3 bg-pink-100 rounded w-1/3" />
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600  to-cyan-600 flex justify-center sm:justify-start items-center gap-3 flex-wrap">
              <FolderHeart className="w-8 sm:w-10 h-8 sm:h-10 text-pink-500" />
              Category Management
            </h1>
            <p className="text-pink-700/70 font-medium mt-2 text-sm sm:text-base">
              Manage all beauty & cosmetics categories seamlessly
            </p>
          </div>

          {/* Search + Add */}
          <div className="bg-white rounded-2xl border border-pink-100 p-4 sm:p-6 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition text-sm sm:text-base"
              />
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600  to-cyan-600 text-white font-semibold shadowhover:from-cyan-300 hover:to-cyan-700 transition text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Add Category
            </button>
          </div>

          {/* Category Grid */}
          {isLoading || isFetching ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">Failed to load categories.</p>
            </div>
          ) : filtered.length ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((cat) => {
                const displayName = getName(cat);
                return (
                  <div
                    key={(cat as any)._id}
                    className="bg-white rounded-2xl border border-pink-100 shadow-sm hover:shadow-md transition overflow-hidden group flex flex-col"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-pink-100 to-rose-100">
                      {isValidImageUrl(cat.image) ? (
                        <Image
                          src={cat.image!}
                          alt={displayName || "Category"}
                          width={600}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-pink-200" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${
                            (cat as any).status === "ACTIVE"
                              ? "bg-pink-600 text-white"
                              : "bg-gray-400 text-white"
                          }`}
                        >
                          {(cat as any).status}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                        {displayName || "Untitled"}
                      </h3>
                      <p className="text-sm text-pink-700/70 font-medium mb-3 line-clamp-2">
                        {getDesc(cat)}
                      </p>
                      <div className="mt-auto flex gap-2 flex-wrap">
                        <button
                          onClick={() => openModal(cat)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pink-50 text-pink-700 border border-pink-100 hover:from-cyan-300 hover:to-cyan-700 transition text-sm"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => setConfirmId((cat as any)._id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition text-sm"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-pink-100 p-12 text-center shadow-sm">
              <FolderHeart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No categories yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first category
              </p>
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-semibold shadow hover:from-cyan-300 hover:to-cyan-700 transition"
              >
                <Plus className="w-5 h-5" /> Add Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!confirmId}
        title="Delete this category?"
        subtitle="This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-pink-100 shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-pink-600 mb-2">
                {editing ? "Edit Category" : "Add New Category"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((s) => ({ ...s, slug: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-lg border-2 border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
                    required
                  />
                </div>
              </div>

              <UploadImage
                label="Category Image"
                value={
                  formData.image ? { url: formData.image, publicId: "" } : null
                }
                onChange={(v: UploadValue) =>
                  setFormData((s) => ({ ...s, image: v?.url || "" }))
                }
                disabled={creating || updating}
              />

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, description: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg border-2 border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition resize-none"
                  rows={3}
                  placeholder="Short description..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((s) => ({ ...s, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 text-pink-600 border-pink-200 rounded"
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium text-gray-700"
                >
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white hover:from-cyan-300 hover:to-cyan-700 font-semibold shadow hover:shadow-lg transition disabled:opacity-50"
                >
                  {editing
                    ? updating
                      ? "Updating..."
                      : "Update"
                    : creating
                    ? "Creating..."
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
