import { supabase } from './supabase';
import { CheckoutResponse } from '../types/checkout';

const DEFAULT_APP_SCHEME = process.env.EXPO_PUBLIC_DEFAULT_APP_SCHEME || 'exp://192.168.100.97:8081/--';

export const CheckoutService = {
  async processOrder(
    deliveryAddress: string,
    paymentType: string,
    checkedItemIds: number[],
    promotionId?: number,
    note?: string,          // ghi chú đơn hàng — ghi vào orders.note
    appScheme?: string      // Thêm appScheme từ UI (vd: exp://192.168.100.97:8081/--)
  ): Promise<CheckoutResponse> {
    try {
      if (checkedItemIds.length === 0) {
        throw new Error('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán');
      }

      const { data: orderId, error } = await supabase.rpc('process_checkout', {
        p_delivery_address: deliveryAddress,
        p_payment_type: paymentType,
        p_checked_item_ids: checkedItemIds,
        p_promotion_id: promotionId || null,
        p_note: note || null,
      });

      if (error) throw error;

      if (paymentType.toUpperCase() === 'VNPAY') {
        // Lấy amount từ bảng payments (đã trừ mã giảm giá)
        const { data: paymentInfo, error: getPaymentError } = await supabase
          .from('payments')
          .select('amount')
          .eq('order_id', orderId)
          .single();

        if (getPaymentError) throw getPaymentError;

        // Gọi Edge Function create-payment để tạo URL
        const { data: paymentUrlData, error: edgeError } = await supabase.functions.invoke('create-payment', {
          body: {
            orderId: orderId,
            amount: paymentInfo.amount,
            appScheme: appScheme || DEFAULT_APP_SCHEME,
          },
        });

        if (edgeError) throw edgeError;

        return { 
          success: true, 
          data: { orderId: orderId as number, paymentUrl: paymentUrlData.paymentUrl }, 
          message: 'Đang chuyển hướng thanh toán' 
        };
      }

      return { success: true, data: { orderId: orderId as number }, message: 'Đặt hàng thành công' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};