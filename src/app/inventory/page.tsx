/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import {
  Package,
  Search,
  AlertTriangle,
  TrendingUp,
  Filter,
  Plus,
  Minus,
  History,
  Download,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { useListProductsQuery } from "@/services/products.api";
import { useListCategoriesQuery } from "@/services/categories.api";
import { useAddStockMutation, useRemoveStockMutation } from "@/services/inventory.api";
import type { AddStockRequest, RemoveStockRequest } from "@/types/inventory";

type Product = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  categorySlug?: string;
  subcategorySlug?: string;
  brand?: string;
  status: "ACTIVE" | "DRAFT" | "HIDDEN";
};

type StockFilter = "all" | "low" | "out" | "good";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalType, setModalType] = useState<"add" | "remove" | null>(null);

  const { data: productsData, isLoading, refetch } = useListProductsQuery({});
  const { data: categoriesData } = useListCategoriesQuery();
  const [addStock, { isLoading: adding }] = useAddStockMutation();
  const [removeStock, { isLoading: removing }] = useRemoveStockMutation();

  const products = useMemo<Product[]>(
    () => (productsData?.data?.items ?? productsData?.data ?? []) as Product[],
    [productsData]
  );

  const categories = useMemo(
    () => (categoriesData?.data ?? categoriesData ?? []) as Array<{ _id: string; slug: string; name?: string; title?: string }>,
    [categoriesData]
  );

  const filtered = useMemo(() => {
    let result = products;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      result = result.filter((p) => p.categorySlug === categoryFilter);
    }

    if (stockFilter !== "all") {
      result = result.filter((p) => {
        if (stockFilter === "out") return p.stock === 0;
        if (stockFilter === "low") return p.stock > 0 && p.stock <= 10;
        if (stockFilter === "good") return p.stock > 10;
        return true;
      });
    }

    return result;
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    return { total, outOfStock, lowStock, totalValue };
  }, [products]);

  const openStockModal = (product: Product, type: "add" | "remove") => {
    setSelectedProduct(product);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setModalType(null);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-cyan-600 flex items-center gap-3">
              <Package className="w-10 h-10 text-pink-500" />
              Inventory Management
            </h1>
            <p className="text-pink-700/70 font-medium mt-2">Centralized stock control & monitoring</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-pink-100 p-3 sm:p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Products</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-red-100 p-3 sm:p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Out of Stock</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-yellow-100 p-3 sm:p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Low Stock</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                </div>
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-green-100 p-3 sm:p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Value</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">৳{stats.totalValue.toFixed(0)}</p>
                </div>
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-pink-100 p-3 sm:p-4 mb-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name, brand..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition lg:w-64"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.name || cat.title}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStockFilter("all")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition ${
                    stockFilter === "all"
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStockFilter("out")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition ${
                    stockFilter === "out"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Out
                </button>
                <button
                  onClick={() => setStockFilter("low")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition ${
                    stockFilter === "low"
                      ? "bg-yellow-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Low
                </button>
                <button
                  onClick={() => setStockFilter("good")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition ${
                    stockFilter === "good"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Good
                </button>
              </div>

              <button
                onClick={() => refetch()}
                className="w-full sm:w-auto px-4 py-2 rounded-lg sm:rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="sm:hidden">Refresh</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          {isLoading ? (
            <div className="bg-white rounded-xl sm:rounded-2xl p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-pink-300 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">No products found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700">Product</th>
                      <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-700">Brand</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-gray-700">Stock</th>
                      <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
                      <th className="hidden lg:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-700">Price</th>
                      <th className="hidden lg:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-700">Value</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {filtered.map((product) => {
                      const stockStatus =
                        product.stock === 0 ? "out" : product.stock <= 10 ? "low" : "good";
                      const imgSrc = product.images?.[0] || product.image;

                      return (
                        <tr key={product._id} className="hover:bg-pink-50/50 transition">
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {imgSrc ? (
                                  <Image
                                    src={imgSrc}
                                    alt={product.title}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                  {product.title}
                                </p>
                                <p className="text-xs text-gray-500 truncate md:hidden">{product.brand || "-"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-4 py-3">
                            <span className="text-sm text-gray-700">{product.brand || "-"}</span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                            <span className="text-base sm:text-lg font-bold text-gray-900">{product.stock}</span>
                            <span
                              className={`sm:hidden block mt-1 text-xs font-bold ${
                                stockStatus === "out"
                                  ? "text-red-700"
                                  : stockStatus === "low"
                                  ? "text-yellow-700"
                                  : "text-green-700"
                              }`}
                            >
                              {stockStatus === "out" ? "Out" : stockStatus === "low" ? "Low" : "Good"}
                            </span>
                          </td>
                          <td className="hidden sm:table-cell px-4 py-3 text-center">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                                stockStatus === "out"
                                  ? "bg-red-100 text-red-700"
                                  : stockStatus === "low"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {stockStatus === "out"
                                ? "Out"
                                : stockStatus === "low"
                                ? "Low"
                                : "Good"}
                            </span>
                          </td>
                          <td className="hidden lg:table-cell px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              ৳{product.price}
                            </span>
                          </td>
                          <td className="hidden lg:table-cell px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              ৳{(product.price * product.stock).toFixed(0)}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                              <div className="flex gap-1 sm:gap-2">
                                <button
                                  onClick={() => openStockModal(product, "add")}
                                  className="p-1.5 sm:p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
                                  title="Add Stock"
                                >
                                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => openStockModal(product, "remove")}
                                  className="p-1.5 sm:p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                                  disabled={product.stock === 0}
                                  title="Remove Stock"
                                >
                                  <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => window.location.href = `/products/${product._id}/inventory`}
                                className="flex items-center justify-center gap-1.5 px-2 py-1.5 sm:p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition w-full sm:w-auto text-xs sm:text-sm font-medium"
                                title="View History"
                              >
                                <span className="sm:hidden">History</span>
                                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Modal */}
      {selectedProduct && modalType && (
        <StockModal
          product={selectedProduct}
          type={modalType}
          onClose={closeModal}
          addStock={addStock}
          removeStock={removeStock}
          isLoading={adding || removing}
        />
      )}
    </>
  );
}

function StockModal({
  product,
  type,
  onClose,
  addStock,
  removeStock,
  isLoading,
}: {
  product: Product;
  type: "add" | "remove";
  onClose: () => void;
  addStock: any;
  removeStock: any;
  isLoading: boolean;
}) {
  const [quantity, setQuantity] = useState(0);
  const [stockType, setStockType] = useState<string>(
    type === "add" ? "PURCHASE" : "DAMAGE"
  );
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    try {
      if (type === "add") {
        await addStock({
          productId: product._id,
          quantity,
          type: stockType,
          reason,
          reference,
        } as { productId: string } & AddStockRequest).unwrap();
        toast.success("Stock added successfully");
      } else {
        await removeStock({
          productId: product._id,
          quantity,
          type: stockType,
          reason,
          reference,
        } as { productId: string } & RemoveStockRequest).unwrap();
        toast.success("Stock removed successfully");
      }
      onClose();
    } catch {
      toast.error("Operation failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-pink-100 shadow-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {type === "add" ? "Add Stock" : "Remove Stock"} - {product.title}
          </h2>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm text-gray-600">
              Current Stock: <strong className="text-gray-900">{product.stock}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={quantity || ""}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg border-2 border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
              <select
                value={stockType}
                onChange={(e) => setStockType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
              >
                {type === "add" ? (
                  <>
                    <option value="PURCHASE">Purchase</option>
                    <option value="RETURN">Return</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                  </>
                ) : (
                  <>
                    <option value="DAMAGE">Damage</option>
                    <option value="LOSS">Loss</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reference</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
              placeholder="PO number, invoice..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition resize-none"
              rows={2}
              placeholder="Why are you making this change?"
            />
          </div>

          <div
            className={`rounded-xl p-3 ${
              type === "add"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p className={`text-sm ${type === "add" ? "text-green-800" : "text-red-800"}`}>
              New Stock: <strong>{product.stock + (type === "add" ? quantity : -quantity)}</strong>
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-5 py-2.5 rounded-xl text-white font-semibold transition disabled:opacity-50 ${
                type === "add"
                  ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              }`}
            >
              {isLoading ? "Processing..." : type === "add" ? "Add Stock" : "Remove Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
