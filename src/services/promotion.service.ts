import { supabase } from "./supabase";

//Lấy mã
export const getValidPromotions = async () => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", now)
    .gte("end_date", now);
  if (error) {
    throw error;
  }
  return data;
};

//Tạo mã
export const createPromotion = async (data: {
  name: string;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  min_order_value?: number;
  image_url?: string;
}) => {
  const { data: result, error } = await supabase
    .from("promotions")
    .insert([
      {
        name: data.name,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: true,
        min_order_value: data.min_order_value ?? null,
        image_url: data.image_url ?? null,
      },
    ])
    .select();
  if (error) {
    throw error;
  }
  return result;
};

//Áp dụng mã
export const applyPromotion = (price: number, promo: any) => {
  if (!promo) {
    return price;
  }
  if (promo.discount_type === "percent") {
    return price - (price * promo.discount_value) / 100;
  }

  if (promo.discount_type === "fixed") {
    return Math.max(0, price - promo.discount_value);
  }
  return price;
};
//lấy tất cả mã
export const getAllPromotions = async () => {
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("start_date", {
      ascending: false,
    });
  if (error) {
    throw error;
  }
  return data;
};
//cập nhật khuyến mãi
export const updatePromotion = async (
  id: number,
  data: {
    name: string;
    discount_type: string;
    discount_value: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    min_order_value?: number;
    image_url?: string;
  },
) => {
  const { data: result, error } = await supabase
    .from("promotions")
    .update({
      name: data.name,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: data.is_active,
      min_order_value: data.min_order_value ?? null,
      image_url: data.image_url ?? null,
    })
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }
  return result;
};
//xóa khuyến mãi
export const deletePromotion = async (id: number) => {
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) {
    throw error;
  }
};
