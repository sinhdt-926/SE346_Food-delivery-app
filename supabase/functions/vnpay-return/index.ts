import { serve } from "https://deno.land/std@0.224.0/http/mod.ts";
import crypto from "node:crypto";
import qs from "npm:qs";
import { Buffer } from "node:buffer";
import { createClient } from "npm:@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const params: Record<string, string> = {};

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    // Lấy appScheme truyền từ create-payment
    const dynamicScheme = params.appScheme;
    
    const vnp_SecureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;
    delete params.appScheme; // Xóa appScheme để không ảnh hưởng thuật toán băm của VNPAY

    const secretKey = Deno.env.get("vnp_HashSecret");
    if (!secretKey) {
      throw new Error("Missing vnp_HashSecret environment variable");
    }

    // Hàm sortObject chuẩn của VNPAY
    const sortObject = (obj: any) => {
      const sorted: any = {};
      const str = [];
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          str.push(encodeURIComponent(key));
        }
      }
      str.sort();
      for (let key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
      }
      return sorted;
    };

    const vnpParams: any = {};
    for (const key in params) {
      if (key.startsWith("vnp_")) {
        vnpParams[key] = params[key];
      }
    }
    const sorted = sortObject(vnpParams);
    const signData = qs.stringify(sorted, { encode: false });
    const expectedHash = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    if (expectedHash !== vnp_SecureHash) {
      throw new Error("Invalid signature");
    }
    const isSuccess = params.vnp_ResponseCode === "00";

    // Khởi tạo Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Cập nhật bảng payments
    let paymentStatus = 'failed';
    if (isSuccess) {
      paymentStatus = 'paid';
    } else if (params.vnp_ResponseCode === '24') {
      paymentStatus = 'cancelled'; // 24: Khách hàng chủ động huỷ thanh toán
    }

    const paidAt = isSuccess ? new Date().toISOString() : null;

    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: paymentStatus,
        paid_at: paidAt,
        transaction_no: params.vnp_TransactionNo || null,
        bank_code: params.vnp_BankCode || null,
        vnp_response_code: params.vnp_ResponseCode || null,
        raw_response: params, // Lưu toàn bộ params trả về
      })
      .eq('order_id', params.vnp_TxnRef);

    if (updateError) {
      console.error('Lỗi khi cập nhật bảng payments:', updateError);
    }

    // Redirect về app thông qua Deep Link
    // Ưu tiên dynamicScheme (được gửi từ máy dev hiện tại), nếu không có thì dùng APP_SCHEME env
    const appScheme = dynamicScheme || Deno.env.get("APP_SCHEME") || "exp://127.0.0.1:8081/--";
    
    // Đảm bảo scheme có dấu /-- ở cuối nếu dùng Expo Go
    let finalScheme = appScheme;
    if (finalScheme.startsWith('exp://') && !finalScheme.endsWith('/--')) {
      finalScheme = finalScheme.endsWith('/') ? `${finalScheme}--` : `${finalScheme}/--`;
    }
    // Xóa dấu slash thừa
    if (finalScheme.endsWith('/')) {
        finalScheme = finalScheme.slice(0, -1);
    }
    
    const redirectUrl = `${finalScheme}/payment-result?status=${isSuccess ? 'success' : 'failed'}&orderId=${params.vnp_TxnRef}`;

    return Response.redirect(redirectUrl, 302);
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
