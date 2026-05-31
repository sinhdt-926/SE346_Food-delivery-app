import { serve } from "https://deno.land/std@0.224.0/http/mod.ts";
import crypto from "node:crypto";
import qs from "npm:qs";
import { Buffer } from "node:buffer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Bỏ qua preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, amount, appScheme } = await req.json();

    if (!orderId || !amount) {
      throw new Error("Missing orderId or amount");
    }

    const tmnCode    = Deno.env.get("vnp_TmnCode")!;
    const secretKey  = Deno.env.get("vnp_HashSecret")!;
    const vnpUrl     = Deno.env.get("vnp_Url") || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    
    // Sử dụng vnpay-return function làm URL trả về
    // Mặc định url của edge function vnpay-return
    const returnFunctionUrl = Deno.env.get("VNP_RETURN_URL") || "https://omkcbayujaqdfhbuchjo.supabase.co/functions/v1/vnpay-return";

    const date = new Date();
    // Format YYYYMMDDHHmmss theo chuẩn VNPAY
    const createDate = date.getFullYear().toString() + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + 
                       date.getDate().toString().padStart(2, '0') + 
                       date.getHours().toString().padStart(2, '0') + 
                       date.getMinutes().toString().padStart(2, '0') + 
                       date.getSeconds().toString().padStart(2, '0');

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
      vnp_ReturnUrl:   appScheme ? `${returnFunctionUrl}?appScheme=${encodeURIComponent(appScheme)}` : returnFunctionUrl,
      vnp_TxnRef:      String(orderId),
    };

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

    const sorted = sortObject(params);

    const signData = qs.stringify(sorted, { encode: false });
    const secureHash = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    const paymentUrl = `${vnpUrl}?${qs.stringify(sorted, { encode: false })}&vnp_SecureHash=${secureHash}`;

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
