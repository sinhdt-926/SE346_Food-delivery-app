# 🍔 Food Delivery App

Ứng dụng di động giao đồ ăn FullStack, hỗ trợ hai luồng người dùng riêng biệt: **Khách hàng** đặt món trực tuyến và **Chủ nhà hàng** quản lý hoạt động kinh doanh.

---

## 🚀 Công nghệ sử dụng

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-4A3644?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
</div>

<br>

| Thành phần | Công nghệ |
|---|---|
| Framework di động | React Native (Expo SDK 54), TypeScript |
| Điều hướng | React Navigation (Stack & Bottom Tabs) |
| Quản lý trạng thái | Zustand |
| Backend-as-a-Service | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Bản đồ & Định vị | expo-location, react-native-maps, Nominatim API |
| Thanh toán | VNPay (qua Supabase Edge Function) |
| Animation | Lottie React Native |
| Biểu đồ | react-native-chart-kit |

---

## ✨ Tính năng nổi bật

### 👤 Khách hàng (Customer)

- **Xác thực tài khoản:** Đăng ký, đăng nhập, xác thực OTP qua email, quên mật khẩu, đổi mật khẩu.
- **Hồ sơ cá nhân:** Xem và chỉnh sửa thông tin cá nhân, cập nhật ảnh đại diện.
- **Thực đơn:** Duyệt món ăn theo danh mục, tìm kiếm theo tên, xem chi tiết từng món kèm thông tin khuyến mãi.
- **Giỏ hàng:** Thêm, điều chỉnh số lượng và xóa món; tích chọn món muốn đặt trong lần thanh toán.
- **Đặt hàng:** Chọn địa chỉ giao hàng (từ vị trí GPS, tìm kiếm địa điểm hoặc danh sách đã lưu), thêm ghi chú, áp dụng mã khuyến mãi, thanh toán tiền mặt hoặc VNPay.
- **Theo dõi đơn hàng:** Xem lịch sử và trạng thái đơn hàng cập nhật theo thời gian thực.
- **Địa chỉ giao hàng:** Lưu, quản lý và đặt địa chỉ mặc định để đặt hàng nhanh hơn.

### 👑 Chủ nhà hàng (Owner)

- **Dashboard:** Tổng quan doanh thu, số lượng đơn hàng, món bán chạy và biểu đồ xu hướng theo tuần/tháng.
- **Thực đơn:** Quản lý danh mục và món ăn (thêm, sửa, ẩn/hiện, xóa); upload ảnh minh họa.
- **Đơn hàng:** Xem toàn bộ đơn hàng kèm thông tin khách hàng; cập nhật trạng thái xử lý; nhận thông báo tức thì khi có đơn mới.
- **Thanh toán:** Xem chi tiết thanh toán từng đơn; xác nhận thanh toán tiền mặt.
- **Khuyến mãi:** Tạo, chỉnh sửa và quản lý mã giảm giá theo phần trăm hoặc số tiền cố định.

---

## 📂 Cấu trúc thư mục

```text
/
├── supabase-config/        # SQL scripts khởi tạo và migrate database
├── docs/                   # Tài liệu (SRS, Swagger API)
├── src/
│   ├── assets/             # Tài nguyên tĩnh (ảnh, icons, animation Lottie)
│   ├── components/         # UI Components dùng chung (Button, Card, Input…)
│   ├── navigation/         # Cấu hình điều hướng (AuthStack, CustomerTabs, OwnerStack)
│   ├── screens/
│   │   ├── auth/           # Màn hình xác thực (Login, Register, OTP, Password…)
│   │   ├── customer/       # Màn hình khách hàng (Home, Cart, Orders, Profile…)
│   │   └── owner/          # Màn hình chủ cửa hàng (Dashboard, Menu, Orders…)
│   ├── services/           # Lớp giao tiếp với Supabase (Auth, Food, Cart, Order…)
│   ├── store/              # Global State với Zustand (Auth, Cart)
│   ├── types/              # TypeScript Interfaces & Type Definitions
│   └── utils/              # Hàm tiện ích (format tiền tệ, validate, constants…)
├── App.tsx                 # Entry point
├── app.json                # Cấu hình Expo
└── .env                    # Biến môi trường (không commit lên Git)
```

---

## 📱 Cài đặt nhanh qua file APK (Android)

> [!TIP]
> **Cách nhanh nhất để chạy thử ứng dụng** — không cần cài Node.js, không cần build từ source code. Chỉ cần tải file APK về và cài đặt trực tiếp trên thiết bị Android.

### Tải file APK

File APK bản mới nhất được đính kèm tại mục **[Releases](https://github.com/sinhdt-926/SE346_Food-delivery-app/releases/tag/v1.0.0)** trên GitHub.

### Các bước cài đặt

1. **Tải file APK** — Vào mục **Releases** → tải file `Food Delivery.apk` về điện thoại Android.
2. **Cho phép cài từ nguồn không rõ** — Vào **Cài đặt → Bảo mật** (hoặc **Cài đặt ứng dụng**) → Bật **"Cài đặt ứng dụng không rõ nguồn gốc"** (hoặc cho phép trình duyệt/file manager cài APK).
3. **Cài đặt** — Mở file APK vừa tải → Nhấn **Cài đặt** → Chờ hoàn tất.
4. **Mở ứng dụng** — Tìm icon **Food Delivery** trên màn hình chính và mở lên.

> [!NOTE]
> File APK chỉ hỗ trợ **Android**. Ứng dụng đã được kết nối sẵn với Supabase backend của nhóm — không cần cấu hình thêm gì. Sử dụng tài khoản thử nghiệm trong phần **[Tài khoản thử nghiệm](#-tài-khoản-thử-nghiệm)** bên dưới để đăng nhập.

---

## ⚙️ Chạy từ Source Code (Dành cho Developer)

### Yêu cầu hệ thống

Đảm bảo máy tính đã cài đặt:

- [Node.js](https://nodejs.org/) phiên bản **18 trở lên**
- [Git](https://git-scm.com/)
- Ứng dụng **Expo Go** trên điện thoại ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) hoặc Android/iOS Emulator

---

### Bước 1 — Clone repository

```bash
git clone https://github.com/<your-username>/SE346_Food-delivery-app.git
cd SE346_Food-delivery-app
```

---

### Bước 2 — Cài đặt dependencies

```bash
npm install
```

---

### Bước 3 — Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc dự án với nội dung sau:

```env
# URL của Supabase project (lấy từ Project Settings > API)
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co

# Anon/Public Key của Supabase (lấy từ Project Settings > API)
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Service Role Key — chỉ dùng cho scripts phía server, KHÔNG commit lên Git
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# App scheme để nhận redirect từ VNPay sau khi thanh toán
# Khi chạy Expo Go: dùng địa chỉ IP của máy + cổng (xem terminal sau khi chạy npm start)
# Ví dụ: exp://192.168.1.100:8081/--
EXPO_PUBLIC_DEFAULT_APP_SCHEME=exp://<your-local-ip>:8081/--
```

> **Lưu ý:** File `.env` đã được thêm vào `.gitignore`. Không bao giờ commit file này lên GitHub vì chứa thông tin bảo mật.

---

### Bước 4 — Khởi tạo Database (chỉ lần đầu)

Nếu bạn tự tạo Supabase project, cần chạy SQL script tên `database_schema.sql` trong thư mục `supabase-config/` để khởi tạo schema database (tables, functions, triggers, RLS policies).

1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard) → chọn project của bạn.
2. Vào **SQL Editor** → chạy file `database_schema.sql` trong thư mục `supabase-config`.

---

### Bước 5 — Khởi động ứng dụng

```bash
npm start
```

Sau khi Expo Metro Bundler khởi động:

| Mục tiêu | Cách chạy |
|---|---|
| Chạy trên điện thoại thật | Mở **Expo Go** → quét mã QR hiển thị trong terminal |
| Chạy trên Android Emulator | Nhấn `a` trong terminal (cần Android Studio & AVD) |
| Chạy trên iOS Simulator | Nhấn `i` trong terminal (chỉ trên macOS, cần Xcode) |
| Xóa cache khi gặp lỗi | `npm start -- --clear` hoặc `npx expo start -c` |

> **Lưu ý kết nối mạng:** Điện thoại và máy tính phải cùng mạng Wi-Fi khi dùng Expo Go. Nếu không kết nối được, thử chuyển sang chế độ **Tunnel** bằng cách chạy lệnh `npx expo start --tunnel`

---

## 🔑 Tài khoản thử nghiệm

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Chủ nhà hàng (Owner) | `owner_test@gmail.com` | `123456` |
| Khách hàng (Customer) | `customer_test@gmail.com` | `123456` |

> Nếu chạy với Supabase project riêng, hãy tự tạo tài khoản qua màn hình đăng ký trong ứng dụng. Để tạo tài khoản Owner, cập nhật trường `role = 'owner'` trong bảng `users` trực tiếp qua Supabase Dashboard.

---

## 💳 Tài khoản thử nghiệm thanh toán qua VNPay

| # | Loại thẻ | Thông tin thẻ | Ghi chú |
|---|---|---|---|
| 1 | **NCB (Thẻ ATM nội địa)** | Số thẻ: `9704198526191432198`<br>Tên chủ thẻ: `NGUYEN VAN A`<br>Ngày phát hành: `07/15`<br>OTP: `123456` | Thành công |
| 2 | **VISA (Thẻ quốc tế - No 3DS)** | Số thẻ: `4456530000001005`<br>CVC/CVV: `123`<br>Tên chủ thẻ: `NGUYEN VAN A`<br>Ngày hết hạn: `12/26` | Thành công |
| 3 | **MasterCard (Thẻ quốc tế - No 3DS)** | Số thẻ: `5200000000001005`<br>CVC/CVV: `123`<br>Tên chủ thẻ: `NGUYEN VAN A`<br>Ngày hết hạn: `12/26` | Thành công |

## 📖 Tài liệu liên quan
- [API Documentation (Swagger)](./docs/swagger.json) — Xem trực tiếp tại [Swagger Editor Online](https://editor.swagger.io)