import { create } from "zustand";
import { CartService } from "../services/cart.service";
import { CartItem } from "../types/cart";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  checkedIds: number[]; // Mảng lưu id của các món đã được chọn (checked)
  // Các hàm thao tác trên giỏ hàng
  fetchCart: () => Promise<void>;
  addToCart: (foodId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, newQuantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCheck: (cartItemId: number) => void; // Hàm để toggle check/uncheck một món
  // Hàm dùng để tính tổng tiền các món trong giỏ hàng
  getTotalPrice: () => number;
  resetCartState: () => void;
}

// Thêm một object để quản lý các timeout chống spam click
const updateTimeouts: Record<number, NodeJS.Timeout> = {};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  checkedIds: [], // Khởi tạo mảng rỗng
  // Lấy toàn bộ giỏ hàng từ Database và lưu vào Store
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    const response = await CartService.getCartItems();

    if (response.success && response.data) {
      set({ items: response.data ?? [], isLoading: false });
    } else {
      set({ error: response.error || "Lỗi lấy giỏ hàng", isLoading: false });
    }
  },

  // Thêm món ăn
  addToCart: async (foodId: number, quantity = 1) => {
    set({ isLoading: true, error: null });
    const response = await CartService.addToCart(foodId, quantity);

    if (response.success) {
      // Sau khi thêm thành công trên Supabase, gọi lại hàm fetchCart
      // để cập nhật UI đồng bộ với Database
      await get().fetchCart();
    } else {
      set({ error: response.error || "Lỗi thêm món ăn", isLoading: false });
      throw new Error(response.error || "Lỗi thêm món ăn");
    }
  },

  // Cập nhật số lượng (Debounce + Optimistic Update)
  updateQuantity: async (cartItemId: number, newQuantity: number) => {
    // 1. Cập nhật ngay trên giao diện mà không chờ API
    const originalItems = get().items;
    
    const optimisticItems = newQuantity <= 0 
      ? originalItems.filter(item => item.id !== cartItemId)
      : originalItems.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item);
      
    set({ items: optimisticItems, error: null });

    // 2. Chống spam click (Debounce): Xóa lệnh gọi API cũ nếu user click quá nhanh
    if (updateTimeouts[cartItemId]) {
      clearTimeout(updateTimeouts[cartItemId]);
    }

    // 3. Chờ 400ms không có click mới thì mới gửi API xuống Database
    updateTimeouts[cartItemId] = setTimeout(async () => {
      const response = await CartService.updateQuantity(cartItemId, newQuantity);

      if (!response.success) {
        // Nếu API lỗi, tải lại giỏ hàng chuẩn từ Database để rollback
        set({ error: response.error || "Lỗi cập nhật số lượng" });
        await get().fetchCart();
      }
      
      // Xoá timeout khỏi bộ nhớ
      delete updateTimeouts[cartItemId];
    }, 400);
  },

  // Xóa một món
  removeFromCart: async (cartItemId: number) => {
    set({ isLoading: true, error: null });
    const response = await CartService.removeFromCart(cartItemId);

    if (response.success) {
      set((state) => ({
        checkedIds: state.checkedIds.filter((id) => id !== cartItemId),
      })); // Nếu món bị xóa đang được checked thì bỏ checked
      await get().fetchCart();
    } else {
      set({ error: response.error || "Lỗi xoá món ăn", isLoading: false });
    }
  },

  // Xóa sạch giỏ
  clearCart: async () => {
    set({ isLoading: true, error: null });
    const response = await CartService.clearCart();

    if (response.success) {
      set({ items: [], isLoading: false });
    } else {
      set({
        error: response.error || "Lỗi làm sạch giỏ hàng",
        isLoading: false,
      });
    }
  },

  toggleCheck: (cartItemId: number) => {
    set((state) => {
      const isChecked = state.checkedIds.includes(cartItemId);
      return {
        checkedIds: isChecked
          ? state.checkedIds.filter((id) => id !== cartItemId) // Bỏ check
          : [...state.checkedIds, cartItemId], // Thêm check
      };
    });
  },
  // Hàm tính tổng tiền (Dùng để hiển thị ở nút Thanh toán)
  getTotalPrice: () => {
    const { items, checkedIds } = get();
    return items
      .filter((item) => checkedIds.includes(item.id))
      .reduce((total, item) => {
        return total + item.quantity * (item.foods?.price ?? 0);
      }, 0);
  },
  resetCartState: () => {
    set({ items: [], checkedIds: [] });
  },
}));
