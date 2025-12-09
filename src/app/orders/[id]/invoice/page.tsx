"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useGetOrderByIdQuery } from "@/services/orders.api";
import { useGetProductByIdQuery } from "@/services/products.api";
import { Printer, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

const bnDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

function OrderLineItem({ line }: { line: { productId: string; qty: number; title: string; price: number; image?: string } }) {
  const { data: productData } = useGetProductByIdQuery(line.productId);
  const product = productData?.data;
  
  const title = product?.title || line.title || "Product";
  const price = product?.price || line.price || 0;
  const image = product?.images?.[0] || product?.image || line.image;

  return (
    <tr className="border-b border-gray-200">
      <td className="py-2 px-2">
        <div className="flex items-center gap-2">
          {image && (
            <Image src={image} alt={title} width={40} height={40} className="w-10 h-10 rounded object-cover" />
          )}
          <span className="text-sm">{title}</span>
        </div>
      </td>
      <td className="py-2 px-2 text-center text-sm">{line.qty}</td>
      <td className="py-2 px-2 text-right text-sm">৳{price}</td>
      <td className="py-2 px-2 text-right text-sm font-semibold">৳{price * line.qty}</td>
    </tr>
  );
}

export default function InvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const autoPrint = searchParams.get("print") === "true";

  const { data, isLoading } = useGetOrderByIdQuery(orderId);
  const order = data?.data;

  useEffect(() => {
    if (autoPrint && order) {
      setTimeout(() => window.print(), 500);
    }
  }, [autoPrint, order]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
        {/* Action Buttons */}
        <div className="p-4 border-b print:hidden flex gap-2">
          <Link
            href="/orders"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-[#167389] text-white rounded-lg hover:bg-pink-700 transition"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center border-b-2 border-[#167389] pb-4 mb-6">
            <h1 className="text-3xl font-bold text-[#167389] mb-2">
              {process.env.NEXT_PUBLIC_BRAND || "Amar Shop"}
            </h1>
            <p className="text-sm text-gray-600">INVOICE</p>
            <div className="mt-2 text-xs text-gray-500">
              <p>Order ID: {order._id}</p>
              <p>Date: {bnDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Customer & Status */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">Bill To:</h3>
              <p className="text-sm text-gray-700">{order.customer.name}</p>
              <p className="text-sm text-gray-600">{order.customer.phone}</p>
              <p className="text-sm text-gray-600">
                {[
                  (order.customer as Record<string, string>).houseOrVillage,
                  (order.customer as Record<string, string>).roadOrPostOffice,
                  (order.customer as Record<string, string>).blockOrThana,
                  (order.customer as Record<string, string>).district,
                ]
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Status:</h3>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                {order.status}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="py-2 px-2 text-left text-xs font-bold text-gray-700">Item</th>
                  <th className="py-2 px-2 text-center text-xs font-bold text-gray-700">Qty</th>
                  <th className="py-2 px-2 text-right text-xs font-bold text-gray-700">Price</th>
                  <th className="py-2 px-2 text-right text-xs font-bold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((line, idx) => (
                  <OrderLineItem key={idx} line={line} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">৳{order.totals.subTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-semibold">৳{order.totals.shipping}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Grand Total:</span>
                  <span className="text-[#167389]">৳{order.totals.grandTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">Thank you for your order!</p>
            <p className="text-sm text-gray-500 mt-1">
              Contact: {process.env.NEXT_PUBLIC_HOTLINE || "01700000000"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
