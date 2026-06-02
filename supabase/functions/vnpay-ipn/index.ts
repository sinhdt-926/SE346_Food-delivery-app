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

    const vnp_SecureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const secretKey = Deno.env.get("vnp_HashSecret");
    if (!secretKey) {
      console.error("Missing vnp_HashSecret environment variable");
      return new Response(JSON.stringify({ RspCode: "99", Message: "Unknown Error" }), { status: 500 });
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
      console.error("Invalid signature in IPN");
      return new Response(JSON.stringify({ RspCode: "97", Message: "Invalid Checksum" }), { status: 200 });
    }

    const isSuccess = params.vnp_ResponseCode === "00";

    // Khởi tạo Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(JSON.stringify({ RspCode: "99", Message: "Unknown Error" }), { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Lấy thông tin đơn hàng hiện tại
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('payments')
      .select('status, amount')
      .eq('order_id', params.vnp_TxnRef)
      .single();

    if (fetchError || !payment) {
      console.error("Order not found in IPN");
      return new Response(JSON.stringify({ RspCode: "01", Message: "Order Not Found" }), { status: 200 });
    }

    // Kiểm tra số tiền
    // VNPay gửi số tiền nhân 100, cần chia lại để so sánh
    const vnpAmount = parseInt(params.vnp_Amount, 10) / 100;
    if (payment.amount !== vnpAmount) {
      console.error("Invalid amount in IPN");
      return new Response(JSON.stringify({ RspCode: "04", Message: "Invalid Amount" }), { status: 200 });
    }

    // Nếu đơn hàng đã được cập nhật trước đó
    if (payment.status !== 'unpaid' && payment.status !== 'pending') {
      console.log("Order already confirmed");
      return new Response(JSON.stringify({ RspCode: "02", Message: "Order already confirmed" }), { status: 200 });
    }

    // Cập nhật bảng payments
    const paymentStatus = isSuccess ? 'paid' : 'failed';
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
      return new Response(JSON.stringify({ RspCode: "99", Message: "Unknown Error" }), { status: 500 });
    }

    return new Response(JSON.stringify({ RspCode: "00", Message: "Confirm Success" }), { status: 200 });
  } catch (err: any) {
    console.error("Lỗi Exception trong IPN:", err);
    return new Response(JSON.stringify({ RspCode: "99", Message: "Unknown Error" }), { status: 500 });
  }
});
