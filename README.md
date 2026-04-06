# Đồ án: Food Delivery App

Một ứng dụng di động giao đồ ăn toàn diện (Full-stack Mobile App) được xây dựng bằng React Native và Supabase. Hệ thống hỗ trợ hai luồng người dùng riêng biệt: **Khách hàng** (Customer) để đặt món và **Chủ nhà hàng** (Owner) để quản lý thực đơn, đơn hàng và theo dõi doanh thu.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-4A3644?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />

  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
</div>

<br>

- **Frontend:** React Native (Expo Go), TypeScript.
- **Navigation:** React Navigation (Stack & Bottom Tabs).
- **State Management:** Zustand.
- **Backend as a Service:** Supabase (PostgreSQL, Authentication, Storage, Edge Functions/RPC).

---

## ✨ Tính năng nổi bật (Features)

### 👤 Khách hàng (Customer)

- Đăng nhập / Đăng ký tài khoản.
- Xem danh sách món ăn theo danh mục.
- Xem chi tiết món ăn và thêm vào giỏ hàng.
- Quản lý giỏ hàng (thêm, bớt, xóa món, tính tổng tiền).
- Đặt hàng và áp dụng mã khuyến mãi.
- Theo dõi lịch sử đơn hàng và trạng thái giao hàng.

### 👑 Chủ nhà hàng (Owner)

- Xem tổng quan thống kê doanh thu và số lượng đơn hàng.
- Quản lý thực đơn (Thêm, sửa, xóa, ẩn món ăn, upload hình ảnh).
- Quản lý đơn hàng (Xem danh sách đơn, thay đổi trạng thái đơn: _Chờ xác nhận -> Đang nấu -> Đang giao_).
- Quản lý mã khuyến mãi.

---

## 📂 Cấu trúc thư mục (Folder Structure)

```text
/
├── /supabase-config     # Chứa các file backup SQL, Type Definitions của Backend
├── /src
│   ├── /assets          # Tài nguyên tĩnh (images, fonts, icons)
│   ├── /components      # Các UI Components dùng chung (Button, Card, Input)
│   ├── /navigation      # Cấu hình luồng điều hướng (Auth, OwnerTabs, CustomerTabs)
│   ├── /screens         # Chứa toàn bộ giao diện màn hình (chia theo /owner và /customer)
│   ├── /services        # Các hàm gọi API tương tác với Supabase
│   ├── /store           # Quản lý Global State (Zustand: Auth, Cart)
│   ├── /types           # Định nghĩa TypeScript Interfaces & Supabase Gen Types
│   └── /utils           # Các hàm hỗ trợ (Format tiền tệ, Validate, Constants)
├── App.tsx              # Entry point bọc Navigation Provider
└── app.json             # File cấu hình Expo
```
