import { supabase } from './supabase';

export interface UserAddress {
    id: number;
    user_id: string;
    label: 'Nhà' | 'Cơ quan' | 'Khác';
    address: string;
    latitude?: number;
    longitude?: number;
    is_default: boolean;
    created_at: string;
}

export type AddressPayload = Omit<UserAddress, 'id' | 'user_id' | 'created_at'>;

export type ServiceResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

export const AddressService = {
    // Lấy tất cả địa chỉ của user hiện tại, sắp xếp mặc định lên trên
    async getAddresses(): Promise<ServiceResponse<UserAddress[]>> {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error('Vui lòng đăng nhập để tiếp tục');

            const { data, error } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data: data as UserAddress[] };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    // Thêm địa chỉ mới
    async addAddress(payload: AddressPayload): Promise<ServiceResponse<UserAddress>> {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error('Vui lòng đăng nhập để tiếp tục');

            const { data, error } = await supabase
                .from('user_addresses')
                .insert([{ ...payload, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: data as UserAddress };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    // Cập nhật địa chỉ
    async updateAddress(id: number, payload: Partial<AddressPayload>): Promise<ServiceResponse<UserAddress>> {
        try {
            const { data, error } = await supabase
                .from('user_addresses')
                .update(payload)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: data as UserAddress };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    // Xóa địa chỉ
    async deleteAddress(id: number): Promise<ServiceResponse> {
        try {
            const { error } = await supabase
                .from('user_addresses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    // Đặt địa chỉ mặc định (Trigger DB sẽ tự bỏ chọn tất cả địa chỉ còn lại và đồng bộ users.address)
    async setDefaultAddress(id: number): Promise<ServiceResponse> {
        try {
            const { error } = await supabase
                .from('user_addresses')
                .update({ is_default: true })
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },
};
