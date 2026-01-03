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
    <tr className="border-b border-gray-200 print-table-row">
      <td className="py-2 px-2 print-table-cell">
        <div className="flex items-center gap-2">
          {image && (
            <Image src={image} alt={title} width={40} height={40} className="w-10 h-10 rounded object-cover print-item-image" />
          )}
          <span className="text-sm print-item-name">{title}</span>
        </div>
      </td>
      <td className="py-2 px-2 text-center text-sm print-table-cell">{line.qty}</td>
      <td className="py-2 px-2 text-right text-sm print-table-cell">৳{price}</td>
      <td className="py-2 px-2 text-right text-sm font-semibold print-table-cell">৳{price * line.qty}</td>
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
    <>
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          @page {
            margin: 0.5in;
            size: A4;
          }
          
          body {
            font-family: 'Arial', sans-serif !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            color: #000 !important;
          }
          
          .print-container {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
          
          .print-content {
            padding: 20px !important;
          }
          
          .print-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-bottom: 2px solid #167389 !important;
            padding-bottom: 15px !important;
            margin-bottom: 20px !important;
          }
          
          .print-logo {
            width: 50px !important;
            height: 50px !important;
          }
          
          .print-brand {
            font-size: 24px !important;
            font-weight: bold !important;
            color: #167389 !important;
            margin: 0 !important;
          }
          
          .print-invoice-label {
            font-size: 11px !important;
            color: #666 !important;
            margin: 0 !important;
          }
          
          .print-order-info {
            font-size: 10px !important;
            color: #666 !important;
            text-align: right !important;
          }
          
          .print-customer-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 20px !important;
            margin-bottom: 20px !important;
          }
          
          .print-section-title {
            font-size: 11px !important;
            font-weight: bold !important;
            color: #333 !important;
            margin-bottom: 8px !important;
          }
          
          .print-section-content {
            font-size: 10px !important;
            color: #666 !important;
            line-height: 1.3 !important;
          }
          
          .print-status {
            display: inline-block !important;
            padding: 4px 8px !important;
            font-size: 9px !important;
            font-weight: bold !important;
            border-radius: 3px !important;
            background: #e3f2fd !important;
            color: #1976d2 !important;
            border: 1px solid #bbdefb !important;
          }
          
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 20px !important;
          }
          
          .print-table-header {
            background: #f5f5f5 !important;
            border-bottom: 2px solid #ddd !important;
          }
          
          .print-table-header th {
            padding: 8px 6px !important;
            font-size: 10px !important;
            font-weight: bold !important;
            color: #333 !important;
            text-align: left !important;
            vertical-align: bottom !important;
          }
          
          .print-table-row {
            border-bottom: 1px solid #eee !important;
          }
          
          .print-table-cell {
            padding: 6px !important;
            font-size: 10px !important;
            vertical-align: bottom !important;
          }
          
          .print-item-image {
            width: 30px !important;
            height: 30px !important;
            border-radius: 3px !important;
            object-fit: cover !important;
          }
          
          .print-item-name {
            font-size: 10px !important;
            color: #333 !important;
            max-width: 200px !important;
            word-wrap: break-word !important;
          }
          
          .print-totals-section {
            border-top: 2px solid #ddd !important;
            padding-top: 15px !important;
            display: flex !important;
            justify-content: flex-end !important;
            align-items: flex-start !important;
          }
          
          .print-footer-left {
            width: 45% !important;
            position: absolute !important;
            left: 20px !important;
          }
          
          .print-totals-right {
            width: 250px !important;
            min-width: 250px !important;
          }
          
          .print-total-row {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 8px !important;
            font-size: 12px !important;
            min-width: 200px !important;
          }
          
          .print-grand-total {
            display: flex !important;
            justify-content: space-between !important;
            font-size: 16px !important;
            font-weight: bold !important;
            border-top: 1px solid #ddd !important;
            padding-top: 10px !important;
            margin-top: 10px !important;
            color: #167389 !important;
            min-width: 200px !important;
          }
          
          .print-thank-you {
            font-size: 11px !important;
            color: #666 !important;
            margin-bottom: 5px !important;
          }
          
          .print-contact {
            font-size: 10px !important;
            color: #888 !important;
          }
          
          .print-table-header th:nth-child(2),
          .print-table-header th:nth-child(3),
          .print-table-header th:nth-child(4) {
            text-align: right !important;
          }
          
          .print-table-cell:nth-child(2),
          .print-table-cell:nth-child(3),
          .print-table-cell:nth-child(4) {
            text-align: right !important;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
        <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none mt-16 print-container">
        {/* Action Buttons */}
        <div className="p-4 border-b print:hidden flex gap-2">
          <Link
            href="/orders"
            className="flex items-center gap-2 px-2  bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            All Orders
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2 bg-gray-100 text-gray-700 border border-teal-800 p-1 rounded-xl hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 bg-[#167389] text-white rounded-lg hover:bg-pink-700 transition"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-8 print-content">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#167389] pb-4 mb-6 print-header">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center print-logo">
                <Image
                  src="/logo-amar-shop.jpg"
                  alt="Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#167389] print-brand">
                  {process.env.NEXT_PUBLIC_BRAND || "Amar Shop"}
                </h1>
                <p className="text-sm text-gray-600 print-invoice-label">INVOICE</p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 print-order-info">
              <p className="font-semibold">Order ID: {order._id}</p>
              <p>Date: {bnDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Customer & Billing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 print-customer-grid">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2 print-section-title">Customer Info:</h3>
              <div className="print-section-content">
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
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2 print-section-title">Billing Info:</h3>
              <div className="print-section-content">
                {(order.customer as Record<string, { houseOrVillage?: string; roadOrPostOffice?: string; blockOrThana?: string; district?: string }>).billingAddress ? (
                  <p className="text-sm text-gray-600">
                    {[
                      (order.customer as Record<string, { houseOrVillage?: string; roadOrPostOffice?: string; blockOrThana?: string; district?: string }>).billingAddress.houseOrVillage,
                      (order.customer as Record<string, { houseOrVillage?: string; roadOrPostOffice?: string; blockOrThana?: string; district?: string }>).billingAddress.roadOrPostOffice,
                      (order.customer as Record<string, { houseOrVillage?: string; roadOrPostOffice?: string; blockOrThana?: string; district?: string }>).billingAddress.blockOrThana,
                      (order.customer as Record<string, { houseOrVillage?: string; roadOrPostOffice?: string; blockOrThana?: string; district?: string }>).billingAddress.district,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Same as customer address</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2 print-section-title">Status:</h3>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 print-status">
                {order.status}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full print-table">
              <thead className="bg-gray-100 border-b-2 border-gray-300 print-table-header">
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

          {/* Footer & Totals */}
          <div className="border-t-2 border-gray-300 pt-4 print-totals-section">
            <div className="flex justify-between items-start">
              {/* Footer Section */}
              <div className="w-64 print-footer-left">
                <p className="text-sm text-gray-600 print-thank-you">Thank you for your order!</p>
                <p className="text-sm text-gray-500 mt-1 print-contact">
                  Contact: {process.env.NEXT_PUBLIC_HOTLINE || "01700000000"}
                </p>
              </div>
              
              {/* Totals Section */}
              <div className="w-64 space-y-2 print-totals-right">
                <div className="flex justify-between text-sm print-total-row">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">৳{order.totals.subTotal}</span>
                </div>
                <div className="flex justify-between text-sm print-total-row">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-semibold">৳{order.totals.shipping}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 print-grand-total">
                  <span>Grand Total:</span>
                  <span className="text-[#167389]">৳{order.totals.grandTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
