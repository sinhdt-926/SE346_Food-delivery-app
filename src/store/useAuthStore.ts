import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';

// Định nghĩa kiểu dữ liệu User mở rộng thêm trường publicProfile từ bảng users
export interface AppUser extends User {
    publicProfile?: any;
}

interface ProfileData {
    fullName?: string;
    email?: string;
    phone?: string;
    imageUrl?: string;
}

interface AuthState {
    user: AppUser | null;
    isLoading: boolean;
    error: string | null;
    // Lấy thông tin user từ Supabase và lưu vào store
    fetchUser: () => Promise<void>;
    // Set user trực tiếp (ví dụ: ngay sau khi login thành công)
    setUser: (user: AppUser | null) => void;
    // Cập nhật thông tin hồ sơ người dùng
    updateProfile: (profileData: ProfileData) => Promise<void>;
    // Xóa thông tin user khi đăng xuất
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: false,
    error: null,

    fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
            const user = await authService.getCurrentUser();
            set({ user, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Không thể lấy thông tin người dùng',
                isLoading: false,
                user: null,
            });
        }
    },

    setUser: (user) => set({ user }),

    updateProfile: async (profileData: ProfileData) => {
        // Không set isLoading toàn cục để tránh gây re-render navigation
        // isLoading riêng được quản lý tại từng màn hình (isSaving state)
        set({ error: null });
        try {
            const updatedUser = await authService.updateProfile(profileData);
            // Cập nhật user mới vào store mà KHÔNG trigger navigation re-render
            set({ user: updatedUser });
        } catch (error: any) {
            set({
                error: error.message || 'Không thể cập nhật thông tin hồ sơ',
            });
            // Ném lại lỗi để màn hình có thể bắt và hiển thị Toast
            throw error;
        }
    },

    clearAuth: () => set({ user: null, error: null }),
}));
