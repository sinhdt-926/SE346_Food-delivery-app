import { supabase } from "./supabase";
import { DashboardStats } from "../types/dashboard";

/**
 * Lấy dữ liệu thống kê doanh thu và đơn hàng cho Chủ cửa hàng (owner).
 * 
 * @param startDate Ngày bắt đầu lọc (định dạng ISO string, ví dụ: 2026-05-01T00:00:00Z)
 * @param endDate Ngày kết thúc lọc (định dạng ISO string, ví dụ: 2026-05-30T23:59:59Z)
 */
export const getDashboardStats = async (
  startDate?: string,
  endDate?: string
): Promise<DashboardStats> => {
  const { data, error } = await supabase.rpc("get_owner_dashboard_stats", {
    p_start_date: startDate || null,
    p_end_date: endDate || null,
  });

  if (error) {
    throw error;
  }

  if (data && data.length > 0) {
    const stats = data[0];
    return {
      total_revenue: Number(stats.total_revenue ?? 0),
      total_orders: Number(stats.total_orders ?? 0),
      completed_orders: Number(stats.completed_orders ?? 0),
      cancelled_orders: Number(stats.cancelled_orders ?? 0),
      active_menu_items: Number(stats.active_menu_items ?? 0),
      revenue_by_date: (stats.revenue_by_date ?? []).map((item: any) => ({
        date: item.date,
        revenue: Number(item.revenue ?? 0),
        order_count: Number(item.order_count ?? 0),
      })),
      orders_by_status: (stats.orders_by_status ?? []).map((item: any) => ({
        status: item.status,
        count: Number(item.count ?? 0),
      })),
      top_selling_foods: (stats.top_selling_foods ?? []).map((item: any) => ({
        food_id: Number(item.food_id ?? 0),
        name: item.name ?? "",
        image_url: item.image_url ?? null,
        quantity: Number(item.quantity ?? 0),
        revenue: Number(item.revenue ?? 0),
      })),
    };
  }

  throw new Error("Không thể tải thông tin thống kê.");
};
