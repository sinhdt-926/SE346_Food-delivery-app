import { serve } from "https://deno.land/std@0.224.0/http/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import crypto from "node:crypto";
import qs from "npm:qs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const secretKey = Deno.env.get("VNP_HASH_SECRET")!;

    const { vnp_SecureHash, ...params } = body;

    const sorted = Object.keys(params)
      .sort()
      .reduce((acc: any, key) => { acc[key] = params[key]; return acc; }, {});

    const signData = qs.stringify(sorted, { encode: false });
    const expectedHash = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    // Chữ ký sai
    if (expectedHash !== vnp_SecureHash) {
      return new Response(
        JSON.stringify({ RspCode: '97', Message: 'Invalid signature' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Không tìm thấy order
    if (!order) {
      return new Response(
        JSON.stringify({ RspCode: '01', Message: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Order đã xử lý rồi (tránh duplicate)
    if (order.status !== 'unpaid') {
      return new Response(
        JSON.stringify({ RspCode: '02', Message: 'Order already confirmed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const orderId = Number(params.vnp_TxnRef);
    const isSuccess = params.vnp_ResponseCode === "00";

    // Cập nhật payments
    await supabase
      .from("payments")
      .update({
        status: isSuccess ? "paid" : "failed",
        paid_at: isSuccess ? new Date().toISOString() : null,
        transaction_no: params.vnp_TransactionNo,
        bank_code: params.vnp_BankCode,
        vnp_response_code: params.vnp_ResponseCode,
        secure_hash: vnp_SecureHash,
      })
      .eq("order_id", orderId);

    // Cập nhật orders
    await supabase
      .from("orders")
      .update({ status: isSuccess ? "confirmed" : "cancelled" })
      .eq("id", orderId);

    return new Response(JSON.stringify({ success: isSuccess }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ RspCode: '00', Message: 'Confirm Success' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});