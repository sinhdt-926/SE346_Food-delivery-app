import { supabase } from "./supabase";

export const authService = {
  // 1. Đăng nhập
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // 2. Đăng ký
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  // 3. Gửi OTP quên mật khẩu
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  },

  // 4. Xác thực OTP (Dùng chung cho Đăng ký và Quên mật khẩu)
  verifyOtp: async (
    email: string,
    token: string,
    type: "signup" | "recovery",
  ) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    if (error) throw error;
    return data;
  },

  // 5. Cập nhật mật khẩu mới
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // 7. Cập nhật thông tin hồ sơ (full_name, phone, email...)
  updateProfile: async (profileData: {
    fullName?: string;
    phone?: string;
    email?: string;
  }) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: profileData.fullName,
        phone: profileData.phone,
        email: profileData.email,
      },
    });
    if (error) throw error;
    return data.user;
  },
};
