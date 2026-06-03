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
          // Lưu cả hai key để tương thích trigger (fullname) và UI (full_name)
          fullname: name,
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

  // 6. Upload Avatar
  uploadAvatar: async (uri: string) => {
    const fileName = `avatars/avatar-${Date.now()}.jpg`;
    
    const formData = new FormData();
    formData.append("file", {
      uri: uri,
      name: `avatar.jpg`,
      type: "image/jpeg",
    } as any);

    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, formData);
      
    if (error) {
      throw error;
    }
    const { data } = await supabase.storage.from("images").getPublicUrl(fileName);
    return data.publicUrl;
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

    if (user) {
      // Lấy thêm thông tin từ bảng public.users
      const { data: publicProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (publicProfile) {
        (user as any).publicProfile = publicProfile;
      }
    }

    return user;
  },

  // 7. Cập nhật thông tin hồ sơ người dùng
  // Cập nhật đồng thời: auth.users (user_metadata) VÀ public.users (bảng profile)
  updateProfile: async (profileData: {
    fullName?: string;
    phone?: string;
    email?: string;
    imageUrl?: string;
  }) => {
    // Lấy user hiện tại để có ID
    const { data: { user: currentUser }, error: getUserError } = await supabase.auth.getUser();
    if (getUserError) throw getUserError;
    if (!currentUser) throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");

    // BƯỚC 1: Update auth.users (user_metadata) để UI đọc được ngay
    const authUpdatePayload: Record<string, any> = {
      data: {
        full_name: profileData.fullName,
        fullname: profileData.fullName, // đồng bộ cả hai key
        phone: profileData.phone,
        image_url: profileData.imageUrl,
      },
    };

    // Email phải nằm ở top-level, không phải trong data
    if (profileData.email && profileData.email.trim() !== "") {
      authUpdatePayload.email = profileData.email.trim();
    }

    const { data: authData, error: authError } = await supabase.auth.updateUser(authUpdatePayload);
    if (authError) throw authError;

    // BƯỚC 2: Update public.users (bảng profile riêng) để lưu vào database
    const publicUpdatePayload: Record<string, any> = {
      fullname: profileData.fullName,
      phone_number: profileData.phone,
    };

    if (profileData.imageUrl) {
      publicUpdatePayload.image_url = profileData.imageUrl;
    }

    // Chỉ update email trong public.users nếu có thay đổi
    if (profileData.email && profileData.email.trim() !== "") {
      publicUpdatePayload.email = profileData.email.trim();
    }

    const { error: publicError } = await supabase
      .from("users")
      .update(publicUpdatePayload)
      .eq("id", currentUser.id);

    if (publicError) {
      console.error("Lỗi update public.users:", publicError);
      throw publicError;
    }

    return authData.user;
  },
};
