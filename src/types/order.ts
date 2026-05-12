export type OrderStatus =
  | "pending"
  | "preparing"
  | "delivering"
  | "completed"
  | "cancelled";

export interface Order {
  id: number;
  created_at: string;
  status: OrderStatus;
  address: string;
  customer: {
    id: string;
    fullname: string;
    phone_number: string;
    //avatarUrl?: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    note?: string;
  }[];
  payment: {
    id: number;
    type: string;
    amount: number;
    status: string;
  };
}
