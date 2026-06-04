-- 1. TẠO CÁC BẢNG ĐỘC LẬP (KHÔNG CÓ KHÓA NGOẠI)

-- Bảng Danh mục
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR NOT NULL
);

-- Bảng Khuyến mãi
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    discount_type VARCHAR,
    discount_value DECIMAL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. TẠO BẢNG USERS (LIÊN KẾT VỚI SUPABASE AUTH)

CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR UNIQUE, -- BỔ SUNG THÊM TRƯỜNG EMAIL
    fullname VARCHAR,
    username VARCHAR UNIQUE,
    phone_number VARCHAR,
    role VARCHAR DEFAULT 'customer',
    address VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TẠO CÁC BẢNG CÓ KHÓA NGOẠI

-- Bảng Món ăn
CREATE TABLE foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    image_url VARCHAR,
    price DECIMAL NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL
);

-- Bảng trung gian Khuyến mãi - Món ăn
CREATE TABLE promotion_food (
    promotion_id INT REFERENCES promotions(id) ON DELETE CASCADE,
    food_id INT REFERENCES foods(id) ON DELETE CASCADE,
    PRIMARY KEY (promotion_id, food_id)
);

-- Bảng Giỏ hàng (Mỗi user 1 giỏ)
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE
);

-- Chi tiết giỏ hàng
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    quantity INT DEFAULT 1,
    cart_id INT REFERENCES carts(id) ON DELETE CASCADE,
    food_id INT REFERENCES foods(id) ON DELETE CASCADE
);

-- Bảng Đơn hàng
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR DEFAULT 'pending',
    delivery_address TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Chi tiết đơn hàng
CREATE TABLE order_details (
    id SERIAL PRIMARY KEY,
    quantity INT NOT NULL,
    note TEXT,
    price DECIMAL NOT NULL,
    subtotal DECIMAL NOT NULL,
    food_id INT REFERENCES foods(id) ON DELETE SET NULL,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE
);

-- Bảng Thanh toán
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    type VARCHAR,
    amount DECIMAL NOT NULL,
    status VARCHAR DEFAULT 'unpaid',
    paid_at TIMESTAMP WITH TIME ZONE,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE
);

-- 4. TỰ ĐỘNG HÓA (TRIGGER)
-- Tự động tạo profile trong bảng public.users khi có user mới đăng ký

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- CẬP NHẬT THÊM EMAIL VÀO LỆNH INSERT
  INSERT INTO public.users (id, fullname, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'fullname',
    new.email
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. KHAI BÁO POLICY CHO RLS TRÊN SUPABASE

-- 5.1 Tạo Policy cho phép mọi người (public) được Đọc (SELECT)
CREATE POLICY "Cho phép tat ca moi nguoi xem danh muc"
ON categories
FOR SELECT
TO public
USING (true); -- USING(TRUE) cho phép ai cũng được xem danh mục món ăn

-- 5.2 Tạo Policy cho phép người dùng đã đăng nhập thao tác (Xem, Thêm, Sửa, Xóa) trên giỏ hàng của họ
CREATE POLICY "Nguoi dung quan ly gio hang cua chinh minh"
ON carts
FOR ALL -- Bao gồm SELECT, INSERT, UPDATE, DELETE
TO authenticated -- Chỉ áp dụng cho những người đã đăng nhập
USING (auth.uid() = user_id) -- Điều kiện: ID người dùng hiện tại phải khớp với cột user_id
WITH CHECK (auth.uid() = user_id); -- Đảm bảo khi Insert/Update, họ không thể tự điền user_id của người khác