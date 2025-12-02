"use client";

import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useListOrdersQuery } from "@/services/orders.api";
import { useListProductsQuery } from "@/services/products.api";
import Image from "next/image";

export default function DashboardPage() {
  const { data: ordersData } = useListOrdersQuery({ limit: 5 });
  const { data: productsData } = useListProductsQuery({});

  const orders = ordersData?.data?.items || [];
  const products = productsData?.data?.items || [];

  const totalOrders = ordersData?.data?.total || 0;
  const totalProducts = productsData?.data?.total || products.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totals?.grandTotal || 0), 0);
  const uniqueCustomers = new Set(orders.map(o => o.customer?.email)).size;

  const stats = [
    {
      title: "Total Revenue",
      value: `৳${totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      bgColor: "from-pink-500 to-rose-600",
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      change: "+8.2%",
      isPositive: true,
      icon: ShoppingCart,
      bgColor: "from-purple-500 to-indigo-600",
    },
    {
      title: "Total Products",
      value: totalProducts.toString(),
      change: "+5.1%",
      isPositive: true,
      icon: Package,
      bgColor: "from-rose-500 to-pink-600",
    },
    {
      title: "Total Customers",
      value: uniqueCustomers.toString(),
      change: "-2.4%",
      isPositive: false,
      icon: Users,
      bgColor: "from-fuchsia-500 to-purple-600",
    },
  ];

  const recentOrders = orders.slice(0, 5).map(o => ({
    id: `#${o._id.slice(-6).toUpperCase()}`,
    customer: o.customer?.name || "Guest",
    amount: `৳${(o.totals?.grandTotal || 0).toLocaleString()}`,
    status: o.status,
    time: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A",
  }));

  const topProducts = products.slice(0, 4).map((p: Record<string, unknown>) => ({
    name: (p.title as string) || "Untitled",
    sold: (p.stock as number) || 0,
    revenue: `৳${(((p.price as number) || 0) * ((p.stock as number) || 0)).toLocaleString()}`,
    image: (p.image as string) || "📦",
  }));

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
      pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
      processing: { bg: "bg-blue-100", text: "text-blue-700", icon: AlertCircle },
      delivered: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle },
      cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };

    const normalizedStatus = status?.toLowerCase() || "pending";
    const style = styles[normalizedStatus] || styles.pending;
    const Icon = style.icon;
    const label = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#167389] to-[#167389] mb-2">
            Dashboard Overview
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome back! Here is what is happening with your beauty store
            today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.bgColor} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon
                        className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${
                        stat.isPositive ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {stat.isPositive ? (
                        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                <span className="hidden sm:inline">Recent Orders</span>
                <span className="sm:hidden">Orders</span>
              </h2>
              <button className="text-xs sm:text-sm text-pink-600 hover:text-pink-700 font-semibold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-200 border border-pink-100"
                >
                  <div className="flex-1 w-full sm:w-auto mb-3 sm:mb-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                      <span className="font-bold text-gray-800 text-sm sm:text-base">
                        {order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {order.customer}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{order.time}</p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-lg sm:text-xl font-bold text-pink-600">
                      {order.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                <span className="hidden sm:inline">Top Products</span>
                <span className="sm:hidden">Top</span>
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {topProducts.map((product: { name: string; sold: number; revenue: string; image: string }, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-200 border border-pink-100"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0 overflow-hidden">
                    {typeof product.image === 'string' && product.image.startsWith('http') ? (
                      <Image src={product.image} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <span>{product.image}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Stock: {product.sold}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm font-bold text-pink-600">
                      {product.revenue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
