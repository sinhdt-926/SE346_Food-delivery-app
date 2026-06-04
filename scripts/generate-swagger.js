const fs = require('fs');
const path = require('path');

// Hàm đọc và parse file .env thủ công để không phụ thuộc vào thư viện bên ngoài
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      // Bỏ các dòng comment hoặc dòng trống
      if (line.trim().startsWith('#') || !line.trim()) return;
      
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // Bỏ dấu ngoặc kép hoặc đơn nếu có
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
}

async function fetchSwagger() {
  // Load các biến môi trường từ .env
  loadEnv();

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  // Ưu tiên sử dụng service_role key nếu có để lấy được toàn bộ schema mà không bị lỗi 401/RLS
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !apiKey) {
    console.error("Lỗi: Thiếu EXPO_PUBLIC_SUPABASE_URL hoặc API key trong file .env");
    process.exit(1);
  }

  const cleanUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
  const endpoint = `${cleanUrl}/rest/v1/`;

  try {
    console.log(`Đang kết nối tới Supabase tại: ${cleanUrl}...`);
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("Chú ý: Đang sử dụng ANON_KEY. Nếu gặp lỗi 401 (Invalid API key), vui lòng thêm SUPABASE_SERVICE_ROLE_KEY vào file .env.");
    } else {
      console.log("Đang sử dụng SERVICE_ROLE_KEY để tải tài liệu...");
    }
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.status === 401) {
      const body = await response.json().catch(() => ({}));
      console.error(`\n[Lỗi 401] Không thể xác thực với Supabase.`);
      console.error(`Chi tiết từ Supabase: ${body.message || 'Unauthorized'}`);
      console.error(`Gợi ý: ${body.hint || 'Hãy kiểm tra lại API key.'}`);
      console.error(`\nĐể khắc phục, hãy thực hiện các bước sau:`);
      console.error(`1. Truy cập trang Dashboard của Supabase: https://supabase.com/dashboard`);
      console.error(`2. Đi tới phần Project Settings -> API.`);
      console.error(`3. Copy khóa "service_role" (khóa bí mật dùng cho backend/admin).`);
      console.error(`4. Thêm vào file .env của bạn dòng sau:`);
      console.error(`   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`);
      console.error(`5. Chạy lại lệnh: npm run gen-swagger\n`);
      process.exit(1);
    }

    if (!response.ok) {
      throw new Error(`Yêu cầu thất bại với mã trạng thái HTTP: ${response.status}`);
    }

    const spec = await response.json();

    // Tạo thư mục docs nếu chưa tồn tại
    const docsDir = path.join(__dirname, '../docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // -- Bổ sung Edge Functions vào Swagger Spec --
    if (!spec.paths) spec.paths = {};
    
    spec.paths['/functions/v1/create-payment'] = {
      post: {
        tags: ['Edge Functions'],
        summary: 'Tạo URL thanh toán VNPAY',
        description: 'Gọi Edge Function để tạo URL thanh toán VNPAY cho đơn hàng',
        parameters: [
          {
            in: 'body',
            name: 'body',
            description: 'Thông tin đơn hàng',
            required: true,
            schema: {
              type: 'object',
              properties: {
                orderId: { type: 'integer' },
                amount: { type: 'number' },
                appScheme: { type: 'string' }
              }
            }
          }
        ],
        responses: {
          '200': {
            description: 'Thành công',
            schema: {
              type: 'object',
              properties: {
                paymentUrl: { type: 'string' }
              }
            }
          }
        }
      }
    };

    spec.paths['/functions/v1/vnpay-return'] = {
      get: {
        tags: ['Edge Functions'],
        summary: 'Xử lý kết quả trả về từ VNPAY (IPN/Return)',
        description: 'Nhận kết quả thanh toán từ VNPAY và cập nhật trạng thái đơn hàng. Sau đó redirect về app.',
        parameters: [
          { in: 'query', name: 'vnp_Amount', type: 'string' },
          { in: 'query', name: 'vnp_ResponseCode', type: 'string' },
          { in: 'query', name: 'vnp_TxnRef', type: 'string' },
          { in: 'query', name: 'vnp_SecureHash', type: 'string' }
        ],
        responses: {
          '302': {
            description: 'Redirect về app'
          }
        }
      }
    };

    const outputPath = path.join(docsDir, 'swagger.json');
    fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf8');

    console.log(`\nThành công! Đã sinh file tài liệu Swagger tại:`);
    console.log(`-> ${outputPath}`);
  } catch (error) {
    console.error("\nLỗi hệ thống khi lấy tài liệu Swagger từ Supabase:");
    console.error(error.message);
    process.exit(1);
  }
}

fetchSwagger();
