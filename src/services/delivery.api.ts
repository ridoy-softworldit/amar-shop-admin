import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import type { DeliverySettingsResponse, UpdateDeliverySettingsDTO } from "@/types/delivery";

export const deliveryApi = createApi({
  reducerPath: "deliveryApi",
  baseQuery,
  tagTypes: ["DeliverySettings"],
  endpoints: (builder) => ({
    getDeliverySettings: builder.query<DeliverySettingsResponse, void>({
      query: () => "/admin/delivery-settings",
      providesTags: ["DeliverySettings"],
    }),
    updateDeliverySettings: builder.mutation<DeliverySettingsResponse, UpdateDeliverySettingsDTO>({
      query: (body) => ({
        url: "/admin/delivery-settings",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["DeliverySettings"],
    }),
  }),
});

export const { useGetDeliverySettingsQuery, useUpdateDeliverySettingsMutation } = deliveryApi;
