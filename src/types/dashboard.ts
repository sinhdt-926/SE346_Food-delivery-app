import { OrderStatus } from "./order";

export interface RevenueByDate {
  date: string;
  revenue: number;
  order_count: number;
}

export interface OrdersByStatus {
  status: OrderStatus;
  count: number;
}

export interface TopSellingFood {
  food_id: number;
  name: string;
  image_url: string | null;
  quantity: number;
  revenue: number;
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  active_menu_items: number;
  revenue_by_date: RevenueByDate[];
  orders_by_status: OrdersByStatus[];
  top_selling_foods: TopSellingFood[];
}
