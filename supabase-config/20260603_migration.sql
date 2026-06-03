-- Thêm cột min_order_value vào bảng promotions
ALTER TABLE promotions
    ADD COLUMN IF NOT EXISTS min_order_value DECIMAL;

-- Kiểm tra constraint chưa tồn tại trước khi thêm
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema      = 'public'
          AND table_name        = 'promotions'
          AND constraint_name   = 'check_min_order_value'
    ) THEN
        ALTER TABLE promotions
            ADD CONSTRAINT check_min_order_value
            CHECK (min_order_value >= 0);
    END IF;
END
$$;


-- Thêm cột note vào bảng orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS note TEXT;


-- Cập nhật function process_checkout
CREATE OR REPLACE FUNCTION process_checkout(
    p_delivery_address  TEXT,
    p_payment_type      VARCHAR,
    p_checked_item_ids  INT[],
    p_promotion_id      INT     DEFAULT NULL,
    p_note              TEXT    DEFAULT NULL   -- [MỚI] Ghi chú đơn hàng cấp order
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id       UUID;
    v_cart_id       INT;
    v_order_id      INT;
    v_total_amount  DECIMAL := 0;
    v_discount_type VARCHAR;
    v_discount_value DECIMAL;
    v_min_order_value DECIMAL;
BEGIN
    -- Xác thực user đã đăng nhập
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Người dùng chưa đăng nhập.';
    END IF;

    -- Lấy cart của user
    SELECT id INTO v_cart_id FROM carts WHERE user_id = v_user_id;
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

    -- Tạo đơn hàng — bao gồm cột note
    INSERT INTO orders (user_id, delivery_address, status, note)
    VALUES (v_user_id, p_delivery_address, 'pending', p_note)
    RETURNING id INTO v_order_id;

    -- Tạo chi tiết đơn hàng (không còn cột note)
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


-- Xoá cột note khỏi order_details
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'order_details'
          AND column_name  = 'note'
    ) THEN
        ALTER TABLE order_details DROP COLUMN note;
        RAISE NOTICE 'Đã xoá cột note khỏi order_details.';
    ELSE
        RAISE NOTICE 'Cột note không tồn tại trong order_details — bỏ qua bước DROP.';
    END IF;
END
$$;
