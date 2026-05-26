import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';

interface ProfileData {
    fullName?: string;
    email?: string;
    phone?: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    // Lấy thông tin user từ Supabase và lưu vào store
    fetchUser: () => Promise<void>;
    // Set user trực tiếp (ví dụ: ngay sau khi login thành công)
    setUser: (user: User | null) => void;
    // Cập nhật thông tin hồ sơ người dùng
    updateProfile: (profileData: ProfileData) => Promise<void>;
    // Xóa thông tin user khi đăng xuất
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
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
        set({ isLoading: true, error: null });
        try {
            const updatedUser = await authService.updateProfile(profileData);
            // Cập nhật user mới (đã có user_metadata được refresh) vào store
            set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
            set({
                error: error.message || 'Không thể cập nhật thông tin hồ sơ',
                isLoading: false,
            });
            // Ném lại lỗi để màn hình có thể bắt và hiển thị thông báo
            throw error;
        }
    },

    clearAuth: () => set({ user: null, error: null }),
}));
