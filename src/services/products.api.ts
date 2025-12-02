/* eslint-disable @typescript-eslint/no-explicit-any */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type SizeDTO = { unit?: "ml" | "g" | "pcs"; value?: number };
export type VariantDTO = {
  sku: string;
  shade?: string;
  colorHex?: string;
  size?: SizeDTO;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  image?: string;
};

export type AdminProductDTO = {
  title?: string;
  slug?: string;
  price?: number;
  stock?: number;
  image?: string;
  images?: string[];
  compareAtPrice?: number;
  isDiscounted?: boolean;
  featured?: boolean;
  status?: "ACTIVE" | "DRAFT" | "HIDDEN";
  categorySlug?: string;
  brand?: string;
  description?: string;
  tagSlugs?: string[];
  // cosmetics...
  shade?: string;
  colorHex?: string;
  size?: SizeDTO;
  variants?: VariantDTO[];
  skinType?: string[];
  hairType?: string[];
  concerns?: string[];
  ingredients?: string[];
  allergens?: string[];
  claims?: string[];
  howToUse?: string;
  caution?: string;
  benefits?: string[];
  gender?: "unisex" | "female" | "male";
  origin?: string;
  expiry?: string;
  batchNo?: string;
};

//  Safe base URL (no runtime throw)
const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL;

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("authToken")
          : null;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    //  GET /products?q=...&category=...
    listProducts: builder.query<
      any,
      { page?: number; q?: string; category?: string }
    >({
      query: (p) => {
        const usp = new URLSearchParams();
        if (p?.page) usp.set("page", String(p.page));
        if (p?.q) usp.set("q", p.q);
        if (p?.category) usp.set("category", p.category);
        return { url: `/products?${usp.toString()}`, method: "GET" };
      },
      providesTags: ["Products"],
    }),

    //  POST /products
    createProduct: builder.mutation<any, AdminProductDTO>({
      query: (body) => ({ url: `/admin/products`, method: "POST", body }),
      invalidatesTags: ["Products"],
    }),

    //  PATCH /products/:id
    updateProduct: builder.mutation<any, { id: string } & AdminProductDTO>({
      query: ({ id, ...body }) => ({
        url: `/admin/products/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Products"],
    }),

    //  GET /products/id/:id
    getProductById: builder.query<any, string>({
      query: (id) => ({ url: `/products/id/${id}`, method: "GET" }),
      providesTags: ["Products"],
    }),

    //  DELETE /products/:id
    deleteProduct: builder.mutation<any, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useListProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
