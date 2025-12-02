export type DeliverySettings = {
  freeDeliveryThreshold: number;
  deliveryCharge: number;
  isActive: boolean;
};

export type DeliverySettingsResponse = {
  ok: boolean;
  data?: DeliverySettings;
  message?: string;
};

export type UpdateDeliverySettingsDTO = {
  freeDeliveryThreshold: number;
  deliveryCharge: number;
  isActive: boolean;
};
