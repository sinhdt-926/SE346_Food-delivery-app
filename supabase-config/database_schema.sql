-- DATABASE SCHEMA
-- Tổng hợp đầy đủ từ tất cả các file migration trong supabase-config/
-- Cập nhật lần cuối: 2026-06-03

-- 1. TẠO CÁC BẢNG (KÈM RÀNG BUỘC)

-- Bảng Danh mục
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR NOT NULL,
    CONSTRAINT check_category_name_not_empty CHECK (TRIM(category_name) <> '')
);

-- Bảng Khuyến mãi
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    discount_type VARCHAR,
    discount_value DECIMAL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR,
    min_order_value DECIMAL,
    CONSTRAINT check_discount_type CHECK (discount_type IN ('percent', 'fixed')),
    CONSTRAINT check_discount_value CHECK (
      discount_value > 0 AND (discount_type != 'percent' OR discount_value <= 100)
    ),
    CONSTRAINT check_promotion_dates CHECK (end_date > start_date),
    CONSTRAINT check_min_order_value CHECK (min_order_value >= 0)
);

-- Bảng Users (liên kết với Supabase Auth)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR UNIQUE,
    fullname VARCHAR,
    username VARCHAR UNIQUE,
    phone_number VARCHAR,
    role VARCHAR DEFAULT 'customer',
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image_url VARCHAR,
    CONSTRAINT check_user_role CHECK (role IN ('customer', 'owner')),
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
    CONSTRAINT check_phone_format CHECK (phone_number ~ '^(0|84|[+]84)(3|5|7|8|9)[0-9]{8}$')
);

-- Bảng Địa chỉ người dùng
CREATE TABLE user_addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Khác',
    address TEXT NOT NULL,
    latitude FLOAT8,
    longitude FLOAT8,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng Món ăn
CREATE TABLE foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    image_url VARCHAR,
    price DECIMAL NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT check_food_name_not_empty CHECK (TRIM(name) <> ''),
    CONSTRAINT check_food_price_positive CHECK (price >= 0)
);

-- Bảng trung gian Khuyến mãi - Món ăn
CREATE TABLE promotion_food (
    promotion_id INT REFERENCES promotions(id) ON DELETE CASCADE,
    food_id INT REFERENCES foods(id) ON DELETE CASCADE,
    PRIMARY KEY (promotion_id, food_id)
);

-- Bảng Giỏ hàng
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE
);

-- Chi tiết giỏ hàng
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    quantity INT DEFAULT 1,
    cart_id INT REFERENCES carts(id) ON DELETE CASCADE,
    food_id INT REFERENCES foods(id) ON DELETE CASCADE,
    CONSTRAINT unique_cart_food UNIQUE (cart_id, food_id),
    CONSTRAINT check_cart_qty CHECK (quantity > 0)
);

-- Bảng Đơn hàng
-- Lưu ý: delivery_address lưu dạng JSON string: {"address":"...", "latitude":..., "longitude":...}
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR DEFAULT 'pending',
    delivery_address TEXT,
    note TEXT,
    delivery_started_at TIMESTAMP WITH TIME ZONE,
    promotion_id INT REFERENCES promotions(id),
    discount_amount DECIMAL DEFAULT 0,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT check_order_status CHECK (status IN ('pending', 'preparing', 'delivering', 'completed', 'cancelled'))
);

-- Chi tiết đơn hàng
CREATE TABLE order_details (
    id SERIAL PRIMARY KEY,
    quantity INT NOT NULL,
    price DECIMAL NOT NULL,
    subtotal DECIMAL NOT NULL,
    food_id INT REFERENCES foods(id) ON DELETE SET NULL,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT check_order_qty CHECK (quantity > 0),
    CONSTRAINT check_order_price CHECK (price >= 0 AND subtotal >= 0)
);

-- Bảng Thanh toán
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    type VARCHAR,
    amount DECIMAL NOT NULL,
    status VARCHAR DEFAULT 'unpaid',
    paid_at TIMESTAMP WITH TIME ZONE,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    transaction_no VARCHAR NULL,
    bank_code VARCHAR NULL,
    vnp_response_code VARCHAR NULL,
    raw_response JSONB NULL,
    CONSTRAINT check_payment_amount CHECK (amount >= 0),
    CONSTRAINT check_payment_status CHECK (status IN ('failed','unpaid', 'paid', 'cancelled')),
    CONSTRAINT payments_type_check CHECK (type IN ('cash', 'vnpay'))
);


-- 2. CÁC HÀM (FUNCTIONS) VÀ TRIGGERS

-- Extension để tự động cập nhật updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Lấy quyền của user bỏ qua kiểm tra RLS
-- STABLE: Kết quả ổn định trong cùng một transaction, giúp optimizer tối ưu hơn
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role text;
BEGIN
    SELECT role INTO v_role FROM users WHERE id = auth.uid();
    RETURN v_role;
END;
$$;

-- Tự động tạo profile khi người dùng đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, fullname, email, image_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'fullname',
    new.email,
    COALESCE(
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Tự động cập nhật updated_at khi có thay đổi trên bảng orders
DROP TRIGGER IF EXISTS handle_orders_updated_at ON public.orders;
CREATE TRIGGER handle_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- Đảm bảo chỉ có 1 địa chỉ mặc định mỗi user và đồng bộ vào users.address
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        -- Bỏ chọn mặc định của các địa chỉ khác cùng user
        UPDATE user_addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id 
            AND id != NEW.id 
            AND is_default = TRUE;

        -- Đồng bộ địa chỉ mặc định vào hồ sơ users
        UPDATE users
        SET address = NEW.address
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON user_addresses;
-- Dùng BEFORE để đảm bảo cập nhật diễn ra trước khi ghi dòng mới
CREATE TRIGGER trigger_ensure_single_default_address
BEFORE INSERT OR UPDATE ON user_addresses
FOR EACH ROW 
WHEN (NEW.is_default = TRUE)
EXECUTE FUNCTION ensure_single_default_address();

-- Tự động cập nhật trạng thái thanh toán tiền mặt khi đơn hàng hoàn thành
CREATE OR REPLACE FUNCTION update_payment_on_order_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Chỉ chạy khi trạng thái chuyển từ 'delivering' sang 'completed'
  IF NEW.status = 'completed' AND OLD.status = 'delivering' THEN
    UPDATE payments 
    SET status = 'paid', paid_at = NOW()
    WHERE order_id = NEW.id AND type = 'cash' AND status = 'unpaid';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_payment_on_order_complete ON orders;
CREATE TRIGGER trigger_update_payment_on_order_complete
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE PROCEDURE update_payment_on_order_complete();

-- Thêm món vào giỏ hàng (cộng dồn nếu đã tồn tại)
CREATE OR REPLACE FUNCTION add_to_cart(
    p_cart_id  INT,
    p_food_id  INT,
    p_quantity INT
)
RETURNS SETOF cart_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Kiểm tra quyền sở hữu giỏ hàng
    IF NOT EXISTS (
    SELECT 1 FROM carts
    WHERE id = p_cart_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Không có quyền truy cập giỏ hàng này';
    END IF;
    RETURN QUERY
    INSERT INTO cart_items (cart_id, food_id, quantity)
    VALUES (p_cart_id, p_food_id, p_quantity)
    ON CONFLICT (cart_id, food_id)
    DO UPDATE
        SET quantity = cart_items.quantity + EXCLUDED.quantity
    RETURNING *;
END;
$$;

-- Xử lý luồng thanh toán (tạo đơn hàng, chi tiết, và bản ghi thanh toán trong một transaction)
CREATE OR REPLACE FUNCTION process_checkout(
    p_delivery_address  TEXT,
    p_payment_type      VARCHAR,
    p_checked_item_ids  INT[],
    p_promotion_id      INT     DEFAULT NULL,
    p_note              TEXT    DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id         UUID;
    v_cart_id         INT;
    v_order_id        INT;
    v_total_amount    DECIMAL := 0;
    v_discount_type   VARCHAR;
    v_discount_value  DECIMAL;
    v_min_order_value DECIMAL;
BEGIN
    -- Xác thực user đã đăng nhập
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Người dùng chưa đăng nhập.';
    END IF;

    -- Lấy cart của user, dùng FOR UPDATE để tránh race condition
    SELECT id INTO v_cart_id FROM carts WHERE user_id = v_user_id FOR UPDATE;
    IF v_cart_id IS NULL THEN
        RAISE EXCEPTION 'Giỏ hàng không tồn tại.';
    END IF;

    -- Kiểm tra có sản phẩm được chọn
    IF array_length(p_checked_item_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'Không có sản phẩm nào được chọn để thanh toán.';
    END IF;

    -- Kiểm tra không có món ngừng bán trong danh sách
    IF EXISTS (
        SELECT 1 FROM cart_items ci
        JOIN   foods f ON ci.food_id = f.id
        WHERE  ci.cart_id = v_cart_id
          AND  ci.id      = ANY(p_checked_item_ids)
          AND  f.is_available = FALSE
    ) THEN
        RAISE EXCEPTION 'Trong giỏ hàng có món hiện đang ngừng bán. Vui lòng loại bỏ trước khi thanh toán.';
    END IF;

    -- Tính tổng tiền gốc (trước giảm giá)
    SELECT COALESCE(SUM(ci.quantity * f.price), 0)
    INTO   v_total_amount
    FROM   cart_items ci
    JOIN   foods      f ON ci.food_id = f.id
    WHERE  ci.cart_id = v_cart_id
      AND  ci.id      = ANY(p_checked_item_ids);

    -- Áp dụng mã giảm giá nếu có
    IF p_promotion_id IS NOT NULL THEN
        SELECT discount_type, discount_value, min_order_value
        INTO   v_discount_type, v_discount_value, v_min_order_value
        FROM   promotions
        WHERE  id        = p_promotion_id
          AND  is_active = TRUE
          AND  NOW()     BETWEEN start_date AND end_date;

        IF FOUND THEN
            -- Kiểm tra giá trị tối thiểu đơn hàng
            IF v_min_order_value IS NOT NULL AND v_total_amount < v_min_order_value THEN
                RAISE EXCEPTION 'Đơn hàng chưa đạt giá trị tối thiểu % đ để áp mã giảm giá.',
                    v_min_order_value;
            END IF;

            -- Áp dụng giảm giá
            IF v_discount_type = 'percent' THEN
                v_total_amount := v_total_amount - (v_total_amount * v_discount_value / 100);
            ELSIF v_discount_type = 'fixed' THEN
                v_total_amount := GREATEST(0, v_total_amount - v_discount_value);
            END IF;
        ELSE
            RAISE EXCEPTION 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
        END IF;
    END IF;

    -- Tạo đơn hàng
    INSERT INTO orders (user_id, delivery_address, status, note)
    VALUES (v_user_id, p_delivery_address, 'pending', p_note)
    RETURNING id INTO v_order_id;

    -- Tạo chi tiết đơn hàng
    INSERT INTO order_details (order_id, food_id, quantity, price, subtotal)
    SELECT v_order_id, ci.food_id, ci.quantity, f.price, (ci.quantity * f.price)
    FROM   cart_items ci
    JOIN   foods      f ON ci.food_id = f.id
    WHERE  ci.cart_id = v_cart_id
      AND  ci.id      = ANY(p_checked_item_ids);

    -- Tạo bản ghi thanh toán
    INSERT INTO payments (order_id, type, amount, status)
    VALUES (v_order_id, p_payment_type, v_total_amount, 'unpaid');

    -- Xoá các item đã checkout khỏi giỏ hàng
    DELETE FROM cart_items
    WHERE cart_id = v_cart_id
      AND id      = ANY(p_checked_item_ids);

    RETURN v_order_id;
END;
$$;

-- Thống kê cho Owner Dashboard
-- Dùng ::DATE thay vì TO_CHAR để tối ưu Index scan
CREATE OR REPLACE FUNCTION get_owner_dashboard_stats(
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    total_revenue DECIMAL,
    total_orders BIGINT,
    completed_orders BIGINT,
    cancelled_orders BIGINT,
    active_menu_items BIGINT,
    revenue_by_date JSON,
    orders_by_status JSON,
    top_selling_foods JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_revenue DECIMAL := 0;
    v_total_orders BIGINT := 0;
    v_completed_orders BIGINT := 0;
    v_cancelled_orders BIGINT := 0;
    v_active_menu_items BIGINT := 0;
    v_revenue_by_date JSON;
    v_orders_by_status JSON;
    v_top_selling_foods JSON;
    v_start TIMESTAMPTZ;
    v_end TIMESTAMPTZ;
BEGIN
    -- Chỉ cho phép owner hoặc service_role gọi hàm này
    IF get_current_user_role() IS DISTINCT FROM 'owner' AND auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'Truy cập bị từ chối: Chỉ owner mới có thể xem thông tin thống kê doanh thu và đơn hàng.';
    END IF;

    -- Thiết lập khoảng thời gian mặc định (30 ngày gần nhất) nếu không truyền vào
    v_start := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
    v_end := COALESCE(p_end_date, NOW());

    -- 1. Tổng doanh thu (chỉ tính đơn đã thanh toán)
    SELECT COALESCE(SUM(p.amount), 0) INTO v_total_revenue
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    WHERE p.status = 'paid' AND o.created_at BETWEEN v_start AND v_end;

    -- 2. Tổng số đơn hàng được tạo
    SELECT COUNT(*) INTO v_total_orders
    FROM orders o
    WHERE o.created_at BETWEEN v_start AND v_end;

    -- 3. Số đơn hàng hoàn thành
    SELECT COUNT(*) INTO v_completed_orders
    FROM orders o
    WHERE o.status = 'completed' AND o.created_at BETWEEN v_start AND v_end;

    -- 4. Số đơn hàng đã hủy
    SELECT COUNT(*) INTO v_cancelled_orders
    FROM orders o
    WHERE o.status IN ('cancelled', 'canceled') AND o.created_at BETWEEN v_start AND v_end;

    -- 5. Số lượng món ăn đang hoạt động
    SELECT COUNT(*) INTO v_active_menu_items
    FROM foods f
    WHERE f.is_available = true;

    -- 6. Doanh thu và số lượng đơn hàng theo ngày
    SELECT COALESCE(JSON_AGG(t), '[]'::json) INTO v_revenue_by_date
    FROM (
        SELECT 
            (o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE AS date,
            SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) AS revenue,
            COUNT(DISTINCT o.id) AS order_count
        FROM orders o
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.created_at BETWEEN v_start AND v_end
        GROUP BY (o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE
        ORDER BY date ASC
    ) t;

    -- 7. Thống kê đơn hàng theo trạng thái
    SELECT COALESCE(JSON_AGG(t), '[]'::json) INTO v_orders_by_status
    FROM (
        SELECT 
            o.status,
            COUNT(*) AS count
        FROM orders o
        WHERE o.created_at BETWEEN v_start AND v_end
        GROUP BY o.status
    ) t;

    -- 8. Top 5 món ăn bán chạy nhất
    SELECT COALESCE(JSON_AGG(t), '[]'::json) INTO v_top_selling_foods
    FROM (
        SELECT 
            f.id AS food_id,
            f.name,
            f.image_url,
            SUM(od.quantity)::BIGINT AS quantity,
            SUM(od.subtotal) AS revenue
        FROM order_details od
        JOIN orders o ON od.order_id = o.id
        JOIN foods f ON od.food_id = f.id
        WHERE o.status = 'completed' AND o.created_at BETWEEN v_start AND v_end
        GROUP BY f.id, f.name, f.image_url
        ORDER BY quantity DESC, revenue DESC
        LIMIT 5
    ) t;

    RETURN QUERY SELECT 
        v_total_revenue, v_total_orders, v_completed_orders, v_cancelled_orders, 
        v_active_menu_items, v_revenue_by_date, v_orders_by_status, v_top_selling_foods;
END;
$$;


-- 3. POLICIES VÀ ROW LEVEL SECURITY (RLS)

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_food ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- users
DROP POLICY IF EXISTS "Owner xem tat ca profile" ON public.users;
CREATE POLICY "Owner xem tat ca profile" ON public.users FOR SELECT TO authenticated USING ( get_current_user_role() = 'owner' );
CREATE POLICY "Nguoi dung xem chinh minh" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Nguoi dung tu cap nhat profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- categories
CREATE POLICY "Cho phép tat ca moi nguoi xem danh muc" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Owner quan ly categories" ON categories FOR ALL TO authenticated USING (get_current_user_role() = 'owner');

-- foods
DROP POLICY IF EXISTS "Xem food" ON public.foods;
CREATE POLICY "Xem food" ON public.foods FOR SELECT TO public USING (true);
CREATE POLICY "Owner quan ly foods" ON foods FOR ALL TO authenticated USING (get_current_user_role() = 'owner');

-- promotions
CREATE POLICY "Public xem promotions" ON promotions FOR SELECT TO public USING (true);
CREATE POLICY "Owner quan ly promotions" ON promotions FOR ALL TO authenticated USING (get_current_user_role() = 'owner');

-- promotion_food
CREATE POLICY "Public xem promotion_food" ON promotion_food FOR SELECT TO public USING (true);
CREATE POLICY "Owner quan ly promotion_food" ON promotion_food FOR ALL TO authenticated USING (get_current_user_role() = 'owner');

-- carts
CREATE POLICY "Nguoi dung quan ly gio hang cua chinh minh" ON carts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- cart_items
CREATE POLICY "Nguoi dung quan ly cart_items cua chinh minh" ON cart_items FOR ALL TO authenticated USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())) WITH CHECK (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()));

-- orders
DROP POLICY IF EXISTS "Owner xem tat ca don" ON public.orders;
CREATE POLICY "Owner xem tat ca don" ON public.orders FOR SELECT TO authenticated USING ( get_current_user_role() = 'owner' );
CREATE POLICY "Khach hang xem don cua minh" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Khach hang tao don hang" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Khách hàng chỉ được huỷ đơn đang ở trạng thái 'pending'
CREATE POLICY "Khach hang cap nhat don hang cua minh" ON public.orders FOR UPDATE TO authenticated 
    USING (user_id = auth.uid() AND status = 'pending')
    WITH CHECK (user_id = auth.uid() AND status = 'cancelled');
CREATE POLICY "Owner cap nhat don hang" ON public.orders FOR UPDATE TO authenticated USING (get_current_user_role() = 'owner');

-- order_details
DROP POLICY IF EXISTS "Xem chi tiet don" ON public.order_details;
CREATE POLICY "Xem chi tiet don" ON public.order_details FOR SELECT TO authenticated USING ((order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())) OR (get_current_user_role() = 'owner'));
CREATE POLICY "Khach hang them chi tiet don" ON order_details FOR INSERT TO authenticated WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- payments
CREATE POLICY "Owner xem tat ca thanh toan" ON payments FOR SELECT TO authenticated USING (get_current_user_role() = 'owner');
CREATE POLICY "Khach hang xem thanh toan cua minh" ON payments FOR SELECT TO authenticated USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Khach hang tao thanh toan" ON payments FOR INSERT TO authenticated WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Owner cap nhat thanh toan" ON payments FOR UPDATE TO authenticated USING (get_current_user_role() = 'owner');

-- user_addresses
CREATE POLICY "User xem dia chi cua minh" ON user_addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "User them dia chi" ON user_addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User sua dia chi cua minh" ON user_addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User xoa dia chi cua minh" ON user_addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- ==========================================
-- 4. STORAGE POLICIES (Bucket: images)
-- ==========================================
-- Lưu ý: Bucket "images" cần được tạo thủ công trên Supabase Dashboard
-- (Storage > New bucket > name: "images", Public: true)

-- Cho phép tất cả mọi người xem ảnh công khai
CREATE POLICY "Public doc anh" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'images');

-- Chỉ cho phép người dùng đã đăng nhập tải ảnh lên
CREATE POLICY "Authenticated upload anh" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'images');
