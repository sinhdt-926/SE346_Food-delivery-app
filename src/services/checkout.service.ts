import { supabase } from './supabase';
import { ServiceResponse } from './cart.service';

export type CheckoutResult = {
  orderId: number;
  paymentUrl: string;
};

export const CheckoutService = {
  async processOrder(
    deliveryAddress: string,
    paymentType: 'vnpay' | 'cash',
    checkedItemIds: number[],
    promotionId?: number
  ): Promise<ServiceResponse<CheckoutResult>> {
    try {
      if (checkedItemIds.length === 0) {
        throw new Error('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán');
      }

      // Bước 1: Gọi RPC tạo order + order_details + payment record
      const { data: orderId, error } = await supabase.rpc('process_checkout', {
        p_delivery_address: deliveryAddress,
        p_payment_type: paymentType,
        p_checked_item_ids: checkedItemIds,
        p_promotion_id: promotionId ?? null,
      });

      if (error) throw error;
      if (!orderId) throw new Error('Không thể tạo đơn hàng');

      // Nếu thanh toán tiền mặt thì không cần URL VNPay
      if (paymentType === 'cash') {
        return {
          success: true,
          data: { orderId, paymentUrl: '' },
          message: 'Đặt hàng thành công',
        };
      }

      // Bước 2: Lấy amount từ bảng payments vừa tạo
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('amount')
        .eq('order_id', orderId)
        .single();

      if (paymentError) throw paymentError;

      // Bước 3: Gọi Edge Function tạo URL VNPay
      const { data: vnpayData, error: vnpayError } = await supabase.functions.invoke(
        'create-payment',
        { body: { orderId, amount: Number(payment.amount) } }
      );

      if (vnpayError) throw vnpayError;

      return {
        success: true,
        data: { orderId, paymentUrl: vnpayData.paymentUrl },
        message: 'Đặt hàng thành công',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};