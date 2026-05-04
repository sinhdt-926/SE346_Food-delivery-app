import { supabase } from './supabase';
import { ServiceResponse } from './cart.service';

export const CheckoutService = {
  /**
   * Gọi hàm process_checkout RPC từ Supabase
   * @param deliveryAddress Địa chỉ giao hàng
   * @param paymentType Loại thanh toán (vd: 'cod', 'banking')
   * @param promotionId ID của mã giảm giá (truyền undefined/null nếu không có)
   */
  async processOrder(
    deliveryAddress: string,
    paymentType: string,
    promotionId?: number
  ): Promise<ServiceResponse<number>> {
    try {
      const { data, error } = await supabase.rpc('process_checkout', {
        p_delivery_address: deliveryAddress,
        p_payment_type: paymentType,
        p_promotion_id: promotionId || null,
      });

      if (error) {
        throw error;
      }

      return { 
        success: true, 
        data: data as number, // data trả về chính là order_id từ Postgres
        message: 'Đặt hàng thành công!' 
      };
    } catch (error: any) {
      console.error('Lỗi khi checkout:', error);
      return { 
        success: false, 
        error: error.message || 'Đã xảy ra lỗi trong quá trình thanh toán' 
      };
    }
  },
};