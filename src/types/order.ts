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
  note?: string; // ghi chú cấp đơn hàng — từ orders.note
  customer: {
    id: string;
    fullname: string;
    phone_number: string;
    avatarUrl?: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    image_url?: string;
    subtotal: number;
    // note đã được chuyển lên cấp Order, không còn per-item
  }[];
  payment: {
    id: number;
    type: string;
    amount: number;
    status: string;
  };
}
