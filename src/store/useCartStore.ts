import { create } from 'zustand';
import { CartService } from '../services/cart.service';
import { CartItem } from '../types/cart';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  // Các hàm thao tác trên giỏ hàng
  fetchCart: () => Promise<void>;
  addToCart: (foodId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, newQuantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  // Hàm dùng để tính tổng tiền các món trong giỏ hàng
  getTotalPrice: () => number;
}

// Khởi tạo Zustand Store
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  // Lấy toàn bộ giỏ hàng từ Database và lưu vào Store
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    const response = await CartService.getCartItems();
    
    if (response.success && response.data) {
      set({ items: response.data ?? [], isLoading: false });
    } else {
      set({ error: response.error || 'Lỗi lấy giỏ hàng', isLoading: false });
    }
  },

  // Thêm món ăn
  addToCart: async (foodId: number, quantity = 1) => {
    set({ isLoading: true, error:null });
    const response = await CartService.addToCart(foodId, quantity);
    
    if (response.success) {
      // Sau khi thêm thành công trên Supabase, gọi lại hàm fetchCart 
      // để cập nhật UI đồng bộ với Database
      await get().fetchCart(); 
    } else {
      set({ error: response.error || 'Lỗi thêm món ăn', isLoading: false });
    }
  },

  // Cập nhật số lượng
  updateQuantity: async (cartItemId: number, newQuantity: number) => {
    set({ isLoading: true, error:null });
    const response = await CartService.updateQuantity(cartItemId, newQuantity);
    
    if (response.success) {
      await get().fetchCart();
    } else {
      set({ error: response.error || 'Lỗi cập nhật số lượng', isLoading: false });
    }
  },

  // Xóa một món
  removeFromCart: async (cartItemId: number) => {
    set({ isLoading: true, error:null });
    const response = await CartService.removeFromCart(cartItemId);
    
    if (response.success) {
      await get().fetchCart();
    } else {
      set({ error: response.error || 'Lỗi xoá món ăn', isLoading: false });
    }
  },

  // Xóa sạch giỏ
  clearCart: async () => {
    set({ isLoading: true, error:null });
    const response = await CartService.clearCart();
    
    if (response.success) {
      set({ items: [], isLoading: false });
    } else {
      set({ error: response.error || 'Lỗi làm sạch giỏ hàng', isLoading: false });
    }
  },

  // Hàm tính tổng tiền (Dùng để hiển thị ở nút Thanh toán)
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      return total + (item.quantity * (item.foods?.price ?? 0));
    }, 0);
  }
}));