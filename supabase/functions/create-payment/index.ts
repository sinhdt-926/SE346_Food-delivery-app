import { serve } from "https://deno.land/std@0.224.0/http/mod.ts";
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
    const { orderId, amount } = await req.json();

    const tmnCode    = Deno.env.get("VNP_TMN_CODE")!;
    const secretKey  = Deno.env.get("VNP_HASH_SECRET")!;
    const vnpUrl     = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl  = Deno.env.get("VNP_RETURN_URL")!; // URL app của bạn

    const date = new Date();
    const createDate = date.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);

    const params: Record<string, string> = {
      vnp_Version:     "2.1.0",
      vnp_Command:     "pay",
      vnp_TmnCode:     tmnCode,
      vnp_Amount:      String(amount * 100), // VNPay tính đơn vị x100
      vnp_CreateDate:  createDate,
      vnp_CurrCode:    "VND",
      vnp_IpAddr:      "127.0.0.1",
      vnp_Locale:      "vn",
      vnp_OrderInfo:   `Thanh toan don hang ${orderId}`,
      vnp_OrderType:   "other",
      vnp_ReturnUrl:   returnUrl,
      vnp_TxnRef:      String(orderId),
    };

    // Ký theo thứ tự alphabet
    const sorted = Object.keys(params).sort().reduce((acc: any, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

    const signData = qs.stringify(sorted, { encode: false });
    const secureHash = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;

    return new Response(JSON.stringify({ paymentUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});