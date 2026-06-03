-- 1. Thêm các cột lưu vết Khuyến mãi vào bảng orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS promotion_id INT REFERENCES promotions(id),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL DEFAULT 0;

-- 2. Cập nhật hàm process_checkout để sửa lỗi Race Condition (FOR UPDATE) và lưu vết Khuyến mãi
CREATE OR REPLACE FUNCTION process_checkout(
    p_delivery_address TEXT,
    p_payment_type VARCHAR,
    p_checked_item_ids INT[],
    p_promotion_id INT DEFAULT NULL
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_cart_id INT;
    v_order_id INT;
    v_total_amount DECIMAL := 0;
    v_discount_type VARCHAR;
    v_discount_value DECIMAL;
    v_discount_amount DECIMAL := 0; -- Thêm biến để lưu số tiền được giảm
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Người dùng chưa đăng nhập.'; END IF;

    -- Sửa lỗi Race Condition: Thêm FOR UPDATE để khóa giỏ hàng
    SELECT id INTO v_cart_id FROM carts WHERE user_id = v_user_id FOR UPDATE;
    IF v_cart_id IS NULL THEN RAISE EXCEPTION 'Giỏ hàng không tồn tại.'; END IF;

    -- Kiểm tra mảng id truyền lên có hợp lệ không
    IF array_length(p_checked_item_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'Không có sản phẩm nào được chọn để thanh toán.';
    END IF;

    -- Kiểm tra món có đang bán không trước khi checkout
    IF EXISTS (
        SELECT 1 FROM cart_items ci
        JOIN foods f ON ci.food_id = f.id
        WHERE ci.cart_id = v_cart_id 
          AND ci.id = ANY(p_checked_item_ids) 
          AND f.is_available = FALSE
    ) THEN
        RAISE EXCEPTION 'Trong giỏ hàng có món hiện đang ngừng bán. Vui lòng loại bỏ trước khi thanh toán.';
    END IF;

    -- Bước 1: Tính tổng tiền cho các item được checked
    SELECT COALESCE(SUM(ci.quantity * f.price), 0) INTO v_total_amount
    FROM cart_items ci
    JOIN foods f ON ci.food_id = f.id
    WHERE ci.cart_id = v_cart_id AND ci.id = ANY(p_checked_item_ids);

    IF p_promotion_id IS NOT NULL THEN
        SELECT discount_type, discount_value INTO v_discount_type, v_discount_value
        FROM promotions
        WHERE id = p_promotion_id AND is_active = TRUE AND now() BETWEEN start_date AND end_date;

        IF FOUND THEN
            IF v_discount_type = 'percent' THEN
                v_discount_amount := (v_total_amount * v_discount_value / 100);
                v_total_amount := v_total_amount - v_discount_amount;
            ELSIF v_discount_type = 'fixed' THEN
                v_discount_amount := LEAST(v_total_amount, v_discount_value);
                v_total_amount := v_total_amount - v_discount_amount;
            END IF;
        ELSE
            RAISE EXCEPTION 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
        END IF;
    END IF;

    -- Bước 3: Tạo đơn hàng (Bổ sung promotion_id và discount_amount)
    INSERT INTO orders (user_id, delivery_address, status, promotion_id, discount_amount)
    VALUES (v_user_id, p_delivery_address, 'pending', p_promotion_id, v_discount_amount)
    RETURNING id INTO v_order_id;

    -- Bước 4: Tạo chi tiết đơn hàng cho các món được checked
    INSERT INTO order_details (order_id, food_id, quantity, price, subtotal)
    SELECT v_order_id, ci.food_id, ci.quantity, f.price, (ci.quantity * f.price)
    FROM cart_items ci JOIN foods f ON ci.food_id = f.id
    WHERE ci.cart_id = v_cart_id AND ci.id = ANY(p_checked_item_ids);

    -- Bước 5: Tạo hoá đơn
    INSERT INTO payments (order_id, type, amount, status)
    VALUES (v_order_id, p_payment_type, v_total_amount, 'unpaid');

    -- Bước 6: CHỈ XÓA các sản phẩm đã thanh toán khỏi giỏ
    DELETE FROM cart_items 
    WHERE cart_id = v_cart_id AND id = ANY(p_checked_item_ids);

    RETURN v_order_id;
END;
$$;


-- 3. Cập nhật trigger ensure_single_default_address thành BEFORE
DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON user_addresses;

CREATE TRIGGER trigger_ensure_single_default_address
BEFORE INSERT OR UPDATE ON user_addresses
FOR EACH ROW 
WHEN (NEW.is_default = TRUE)
EXECUTE FUNCTION ensure_single_default_address();


-- 4. Tối ưu hoá hàm get_current_user_role() bằng cách thêm STABLE
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


-- 5. Tối ưu hoá hàm get_owner_dashboard_stats bằng cách dùng ép kiểu ::DATE thay vì TO_CHAR
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
    
    -- Giới hạn ngày
    v_start TIMESTAMPTZ;
    v_end TIMESTAMPTZ;
BEGIN
    -- Chỉ cho phép người dùng có vai trò là 'owner' hoặc 'service_role' gọi hàm này
    IF get_current_user_role() IS DISTINCT FROM 'owner' AND auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'Truy cập bị từ chối: Chỉ owner mới có thể xem thông tin thống kê doanh thu và đơn hàng.';
    END IF;

    -- Thiết lập khoảng thời gian mặc định (30 ngày gần nhất) nếu không truyền vào
    v_start := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
    v_end := COALESCE(p_end_date, NOW());

    -- 1. Tổng doanh thu
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

    -- 6. Doanh thu và số lượng đơn hàng theo ngày (Dùng ::DATE thay vì TO_CHAR để tối ưu Index)
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
        v_total_revenue, 
        v_total_orders, 
        v_completed_orders, 
        v_cancelled_orders, 
        v_active_menu_items, 
        v_revenue_by_date, 
        v_orders_by_status, 
        v_top_selling_foods;
END;
$$;
