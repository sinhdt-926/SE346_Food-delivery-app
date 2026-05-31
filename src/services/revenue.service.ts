import { supabase } from "./supabase";

export const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data, error } = await supabase.rpc("get_owner_dashboard_stats", {
    p_start_date: today.toISOString(),
    p_end_date: new Date().toISOString(),
  });
  if (error) throw error;
  const stats = data?.[0];
  if (!stats) {
    return {
      runningOrders: 0,
      requests: 0,
      totalRevenue: 0,
      revenueChart: {
        labels: [],
        datasets: [{ data: [] }],
      },
    };
  }
  return {
    runningOrders:
      Number(stats.total_orders ?? 0) -
      Number(stats.completed_orders ?? 0) -
      Number(stats.cancelled_orders ?? 0),
    requests:
      stats.orders_by_status?.find((item: any) => item.status === "pending")
        ?.count ?? 0,
    totalRevenue: Number(stats.total_revenue ?? 0),
    revenueChart: {
      labels:
        stats.revenue_by_date?.map((item: any) => item.date.slice(5)) ?? [],
      datasets: [
        {
          data:
            stats.revenue_by_date?.map((item: any) => Number(item.revenue)) ??
            [],
        },
      ],
    },
  };
};
