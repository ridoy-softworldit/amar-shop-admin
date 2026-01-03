"use client";

import { useState } from "react";
import { useListOrdersQuery } from "@/services/orders.api";
import { Users, Mail, ShoppingBag, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const { data: allOrdersData, isLoading } = useListOrdersQuery({ 
    limit: 50000,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  const allOrders = allOrdersData?.data?.items || [];

  const customerMap = new Map();
  
  allOrders.forEach(order => {
    const identifier = order.customer?.email || order.customer?.phone || order.customer?.name || `guest-${order._id}`;
    if (identifier) {
      if (!customerMap.has(identifier)) {
        customerMap.set(identifier, {
          name: order.customer?.name || "Guest",
          email: order.customer?.email || "N/A",
          phone: order.customer?.phone || "N/A",
          orders: 0,
          totalSpent: 0,
          lastOrder: order.createdAt,
        });
      }
      const customer = customerMap.get(identifier);
      customer.orders += 1;
      customer.totalSpent += order.totals?.grandTotal || 0;
      if (order.createdAt && new Date(order.createdAt) > new Date(customer.lastOrder)) {
        customer.lastOrder = order.createdAt;
      }
    }
  });

  const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / allOrders.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#167389] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-16">
        <div className="mb-6 sm:mb-8">
          <Link href="/dashboard" className="inline-flex border border-teal-800 rounded-lg p-1 items-center gap-2 text-gray-600 hover:text-[#167389] mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#167389] to-[#167389] mb-2">
            Customers
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and view your customer information
          </p>
          <div className="flex gap-3 mt-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1 text-center">Total Customers</h3>
            <p className="text-lg sm:text-3xl font-bold text-gray-800 text-center">{totalCustomers}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1 text-center">Avg Order Value</h3>
            <p className="text-lg sm:text-3xl font-bold text-gray-800 text-center">৳{avgOrderValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">All Customers</h2>
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No customers found</p>
              <p className="text-gray-500 text-sm mt-2">Customers will appear here once orders are placed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Phone</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Orders</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-800">{customer.name}</p>
                        <p className="text-xs text-gray-500 sm:hidden">{customer.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{customer.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm hidden md:table-cell">{customer.phone}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {customer.orders}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-600 text-sm">
                      ৳{customer.totalSpent.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
