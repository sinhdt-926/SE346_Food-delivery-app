export type OrderStatus =
  | "pending"
  | "preparing"
  | "delivering"
  | "completed"
  | "cancelled";

export interface Order {
  id: number;
  status: OrderStatus;
  time: string;
  customer: {
    id: string;
    fullname: string;
    phone_number: string;
    //avatarUrl?: string;
  };
  delivery_address: string;
  order_details: {
    id: number;
    quantity: number;
    note?: string;
    subtotal: number;
    food: {
      id: number;
      name: string;
    };
  }[];

  payment: {
    id: number;
    type: string;
    amount: number;
    status: string;
  };
}
