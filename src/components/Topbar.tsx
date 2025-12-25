// components/Topbar.tsx
"use client";

import { logout } from "@/features/auth/auth.slice";
import { useListCategoriesQuery } from "@/services/categories.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import clsx from "clsx";
import {
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Phone,
  Search,
  X,
  Image as ImageIcon,
  Truck,
  Layers,
  PackageSearch,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/products", label: "All Products", icon: Package },
  { href: "/inventory", label: "Stock Management", icon: PackageSearch },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/subcategories", label: "Subcategories", icon: Layers },
  { href: "/brands", label: "Brands", icon: Tag },
  { href: "/banners", label: "Home Banners", icon: ImageIcon },
  { href: "/delivery-settings", label: "Delivery Charge", icon: Truck },
];

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  const [q, setQ] = useState<string>(sp.get("q") ?? "");
  const [cat, setCat] = useState<string>(sp.get("category") ?? "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data, isLoading } = useListCategoriesQuery();
  const cats = data?.data ?? [];

  const brand = process.env.NEXT_PUBLIC_BRAND || "Amar Shop";
  const hotline = process.env.NEXT_PUBLIC_HOTLINE || "01700000000";

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat) params.set("category", cat);
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const onClear = () => {
    setQ("");
    setCat("");
    router.push("/products");
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#167389] backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="flex items-center gap-4 py-4">
          {/* Logo & Brand - Mobile Only */}
          <Link
            href="/"
            className="flex lg:hidden items-center gap-2 shrink-0 group"
            aria-label="Go to homepage"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center">
              <Image
                src="/logo-amar-shop.jpg"
                alt="Amar Shop Logo"
                fill
                sizes="(max-width:768px) 36px, 48px"
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block lg:hidden text-lg font-bold text-white tracking-wide">
              {brand}
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={onSearch}
            className="hidden md:flex items-center gap-2 ml-auto flex-1 max-w-2xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500" />
              <input
                placeholder="Search products..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-white/50 placeholder:text-gray-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-white text-[#167389] font-medium rounded-xl hover:bg-gray-50 transition-all shadow-md whitespace-nowrap"
            >
              Search
            </button>
            {(q || cat) && (
              <button
                type="button"
                onClick={onClear}
                className="px-4 py-2.5 border-2 border-pink-200 text-white font-medium rounded-xl hover:bg-white/10 transition-all whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </form>

          {/* Category Dropdown */}
          <select
            value={cat}
            onChange={(e) => {
              setCat(e.target.value);
              const params = new URLSearchParams();
              if (q.trim()) params.set("q", q.trim());
              if (e.target.value) params.set("category", e.target.value);
              router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
            }}
            disabled={isLoading}
            className="hidden md:block px-4 py-2.5 border-2 border-pink-200 rounded-xl bg-white text-[#167389] font-medium shadow-sm hover:shadow-md transition-all text-sm"
            style={{
              WebkitAppearance: "menulist",
              color: "#167389",
            }}
          >
            <option value="" className="text-[#167389] bg-white font-medium">
              {isLoading ? "Loading..." : "All categories"}
            </option>
            {cats.map((c) => (
              <option
                key={c._id}
                value={c.slug}
                className="text-[#167389] bg-white font-medium"
                style={{
                  backgroundColor: "white",
                  color: "#167389",
                }}
              >
                {c?.title}
              </option>
            ))}
          </select>

          {/* Right Actions */}
          <div className="hidden sm:flex lg:hidden items-center gap-2">
            <a
              title="Call us"
              href={`tel:${hotline}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-pink-200 text-pink-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">{hotline}</span>
            </a>
            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            )}
          </div>

          {/* Desktop Hotline & Logout */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              title="Call us"
              href={`tel:${hotline}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-pink-200 text-pink-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">{hotline}</span>
            </a>
            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="hidden md:hidden pb-4">
          <form onSubmit={onSearch} className="space-y-2">
            <div className="relative">
              <input
                placeholder="Search products..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-white/50 placeholder:text-gray-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500" />
            </div>
            <div className="flex gap-2">
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                disabled={isLoading}
                className="
    w-full px-4 py-3.5 border border-pink-200 rounded-xl
    focus:ring-2 focus:ring-pink-300 focus:border-pink-400
    bg-white text-[#167389] font-medium
    shadow-sm transition-all text-base
    relative z-[50]
  "
                style={{
                  WebkitAppearance: "menulist",
                  color: "#167389",
                }}
              >
                <option
                  value=""
                  className="text-[#167389] bg-white font-medium"
                >
                  {isLoading ? "Loading..." : "All categories"}
                </option>
                {cats.map((c) => (
                  <option
                    key={c._id}
                    value={c.slug}
                    className="bg-white text-[#167389] font-medium"
                    style={{
                      backgroundColor: "white",
                      color: "#167389",
                    }}
                  >
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium rounded-xl shadow-md"
              >
                Search
              </button>
            </div>
            {(q || cat) && (
              <button
                type="button"
                onClick={onClear}
                className="w-full px-4 py-2.5 border-2 border-pink-200 text-pink-700 font-medium rounded-xl hover:bg-pink-50 transition-all"
              >
                Clear Filters
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-pink-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {NAV.map((n) => {
              const Icon = n.icon;
              const isActive = pathname === n.href;

              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-pink-50 hover:text-pink-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{n.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-pink-100 space-y-2">
              <a
                href={`tel:${hotline}`}
                className="flex items-center gap-3 px-4 py-3 border-2 border-pink-200 text-pink-700 font-medium rounded-xl hover:bg-pink-50 transition-all"
              >
                <Phone className="w-5 h-5" />
                <span>{hotline}</span>
              </a>
              {token && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
