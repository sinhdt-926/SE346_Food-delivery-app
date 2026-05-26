import { supabase } from "./supabase";
import { CartItem } from "../types/cart";
import { FoodType } from "../types/cart";
// Chuẩn hoá kiểu trả về cho mọi hàm API
export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export const CartService = {
  // Hàm helper lấy id giỏ hàng của user hiện tại
  // Nếu user chưa có giỏ hàng, tự động tạo mới
  async getOrCreateCartId(): Promise<number> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Bạn cần đăng nhập để sử dụng tính năng này");
    }

    const { data: cart, error: fetchError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (cart) return cart.id;

    if (fetchError && fetchError.code !== "PGRST116") {
      //PGRST116 là lỗi khi không tìm thấy dòng nào
      throw fetchError;
    }

    const { data: newCart, error: createError } = await supabase
      .from("carts")
      .insert([{ user_id: user.id }])
      .select("id")
      .single();

    if (createError) throw createError;
    return newCart.id;
  },

  // Lấy toàn bộ sản phẩm trong giỏ hàng
  async getCartItems(): Promise<ServiceResponse<CartItem[]>> {
    try {
      const cartId = await this.getOrCreateCartId();

      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
    id,
    quantity,
    food_id,
    foods (
      id,
      name,
      price,
      image_url,
      is_available,
      description,
      category_id,
      categories (
        id,
        name
      )
    )
  `,
        )
        .eq("cart_id", cartId)
        .order("id", { ascending: true });

      if (error) throw error;
      const transformedData: CartItem[] = data.map((item) => {
        const foodsData = item.foods;
        const food = Array.isArray(foodsData) ? foodsData[0] : foodsData;
        return {
          id: item.id,
          quantity: item.quantity,
          food_id: item.food_id,

          foods: {
            ...food,

            type: food.categories?.[0]?.name as FoodType,
          },
        };
      });
      return { success: true, data: transformedData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Thêm món ăn vào giỏ hàng
  async addToCart(
    foodId: number,
    quantity: number = 1,
  ): Promise<ServiceResponse> {
    try {
      if (quantity <= 0) throw new Error("Số lượng phải lớn hơn 0");

      const cartId = await this.getOrCreateCartId();

      const { data, error } = await supabase.rpc("add_to_cart", {
        p_cart_id: cartId,
        p_food_id: foodId,
        p_quantity: quantity,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Cập nhật số lượng món ăn (Tăng/Giảm trực tiếp)
  async updateQuantity(
    cartItemId: number,
    newQuantity: number,
  ): Promise<ServiceResponse> {
    try {
      if (newQuantity <= 0) {
        // Nếu số lượng <= 0, tự động xóa khỏi giỏ
        return await this.removeFromCart(cartItemId);
      }

      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", cartItemId)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("Không tìm thấy món ăn trong giỏ hàng của bạn");
        }
        throw error;
      }
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Xóa món ăn khỏi giỏ hàng
  async removeFromCart(cartItemId: number): Promise<ServiceResponse> {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Không tìm thấy món ăn trong giỏ hàng");
      }
      return { success: true, message: "Đã xóa khỏi giỏ hàng" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Làm sạch giỏ hàng (Sau khi user đặt hàng thành công)
  async clearCart(): Promise<ServiceResponse> {
    try {
      const cartId = await this.getOrCreateCartId();

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId);

      if (error) throw error;
      return { success: true, message: "Đã làm sạch giỏ hàng" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
