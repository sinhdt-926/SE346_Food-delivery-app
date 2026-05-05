import { supabase } from './supabase';
import { ServiceResponse } from './cart.service';

export const CheckoutService = {
  async processOrder(
    deliveryAddress: string,
    paymentType: string,
    checkedItemIds: number[], // Thêm mảng ID để kiểm tra món được tick chọn
    promotionId?: number
  ): Promise<ServiceResponse<number>> {
    try {
      if (checkedItemIds.length === 0) {
        throw new Error('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán');
      }

      const { data, error } = await supabase.rpc('process_checkout', {
        p_delivery_address: deliveryAddress,
        p_payment_type: paymentType,
        p_checked_item_ids: checkedItemIds, // Truyền xuống Supabase
        p_promotion_id: promotionId || null,
      });

      if (error) throw error;

      return { success: true, data: data as number, message: 'Đặt hàng thành công' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};