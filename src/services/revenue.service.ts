import { supabase } from "./supabase";

//lấy doanh thu theo ngày
export const getTodayRevenue = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "paid")
    .gte("paid_at", today.toISOString());
  if (error) throw error;
  return data?.reduce((sum, item) => sum + Number(item.amount), 0) ?? 0;
};
//lấy doanh thu theo giờ
export const getTodayRevenueChart = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("payments")
    .select("amount, paid_at")
    .eq("status", "paid")
    .gte("paid_at", today.toISOString());
  if (error) throw error;
  const hourlyRevenue: Record<number, number> = {};
  //24 giờ
  for (let i = 0; i < 24; i++) {
    hourlyRevenue[i] = 0;
  }
  data.forEach((item) => {
    if (!item.paid_at) return;
    const hour = new Date(item.paid_at).getHours();
    hourlyRevenue[hour] += Number(item.amount);
  });
  return {
    labels: Object.keys(hourlyRevenue)
      .filter((_, index) => index % 3 === 0)
      .map((h) => `${h}h`),
    datasets: [
      {
        data: Object.values(hourlyRevenue),
      },
    ],
  };
};
