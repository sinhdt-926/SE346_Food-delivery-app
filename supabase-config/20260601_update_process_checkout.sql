CREATE OR REPLACE FUNCTION process_checkout(
    p_delivery_address TEXT,
    p_payment_type VARCHAR,
    p_checked_item_ids INT[], -- Tham số mới: Mảng ID của các cart_items được chọn
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
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Người dùng chưa đăng nhập.'; END IF;

    SELECT id INTO v_cart_id FROM carts WHERE user_id = v_user_id;
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
                v_total_amount := v_total_amount - (v_total_amount * v_discount_value / 100);
            ELSIF v_discount_type = 'fixed' THEN
                v_total_amount := GREATEST(0, v_total_amount - v_discount_value);
            END IF;
        ELSE
            RAISE EXCEPTION 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
        END IF;
    END IF;

    -- Bước 3: Tạo đơn hàng
    INSERT INTO orders (user_id, delivery_address, status)
    VALUES (v_user_id, p_delivery_address, 'pending')
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
