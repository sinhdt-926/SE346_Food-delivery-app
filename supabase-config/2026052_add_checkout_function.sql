CREATE OR REPLACE FUNCTION process_checkout(
    p_delivery_address TEXT,
    p_payment_type VARCHAR,
    p_promotion_id INT DEFAULT NULL -- Thêm tham số nhận mã giảm giá
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
    IF v_cart_id IS NULL OR NOT EXISTS (SELECT 1 FROM cart_items WHERE cart_id = v_cart_id) THEN
        RAISE EXCEPTION 'Giỏ hàng đang trống hoặc không tồn tại.';
    END IF;

    -- Bước 1: Tính tổng tiền gốc từ giỏ hàng
    SELECT COALESCE(SUM(ci.quantity * f.price), 0) INTO v_total_amount
    FROM cart_items ci
    JOIN foods f ON ci.food_id = f.id
    WHERE ci.cart_id = v_cart_id;

    -- Bước 2: Xử lý logic mã giảm giá (áp dụng thẳng vào tổng bill)
    IF p_promotion_id IS NOT NULL THEN
        -- Lấy thông tin mã giảm giá, đảm bảo nó đang active và còn hạn
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

    -- Bước 3: Tạo Order mới
    INSERT INTO orders (user_id, delivery_address, status)
    VALUES (v_user_id, p_delivery_address, 'pending')
    RETURNING id INTO v_order_id;

    -- Bước 4: Tạo chi tiết đơn hàng (giá ở đây là giá gốc của sản phẩm)
    INSERT INTO order_details (order_id, food_id, quantity, price, subtotal)
    SELECT v_order_id, ci.food_id, ci.quantity, f.price, (ci.quantity * f.price)
    FROM cart_items ci JOIN foods f ON ci.food_id = f.id
    WHERE ci.cart_id = v_cart_id;

    -- Bước 5: Tạo bản ghi thanh toán với số tiền v_total_amount ĐÃ ĐƯỢC GIẢM
    INSERT INTO payments (order_id, type, amount, status)
    VALUES (v_order_id, p_payment_type, v_total_amount, 'unpaid');

    -- Bước 6: Xóa giỏ hàng
    DELETE FROM cart_items WHERE cart_id = v_cart_id;

    RETURN v_order_id;
END;
$$;