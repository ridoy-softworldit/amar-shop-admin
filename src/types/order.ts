export type OrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "IN_SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";


  export type OrderLine = {
    productId: string;
    title: string;
    image?: string;
    price: number;
    qty: number;
  };

  export type Order = {
    _id: string;
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
      area: string;
    };
    lines: OrderLine[];
    totals: {subTotal: number; shipping: number; grandTotal: number};
    status: OrderStatus;
    createdAt?: string;
    updatedAT?: string;
  };

  export type CreateOrderDTO = {
    customer: Order["customer"];
    lines: {productId: string; qty: number}
  };


  export type UpdateOrderDTO = {
    status: OrderStatus;
  }