DO $$ 
DECLARE
    v_user_id UUID := 'f4801bd5-db84-4572-80f3-acb3fce4081b'; 
    v_order_id INT;
    v_cart_id INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id) THEN
        RAISE EXCEPTION 'User ID không tồn tại. Vui lòng tạo tài khoản trên App và thay UUID vào đoạn script.';
    END IF;

    -- Seed Data Giỏ hàng (Dành cho màn hình CartScreen)
    INSERT INTO carts (user_id) VALUES (v_user_id)
    ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO v_cart_id;

    -- Thêm món vào giỏ hàng
    INSERT INTO cart_items (cart_id, food_id, quantity)
    VALUES 
        (v_cart_id, 5, 1),
        (v_cart_id, 3, 2)
    ON CONFLICT (cart_id, food_id) DO NOTHING;

    -- Seed Data Đơn hàng (Dành cho màn hình OrderScreen)
    
    -- 1. Đơn hàng ONGOING (Trạng thái: preparing)
    INSERT INTO orders (user_id, status, delivery_address)
    VALUES (v_user_id, 'preparing', 'KTX Khu B, Dĩ An')
    RETURNING id INTO v_order_id;

    INSERT INTO order_details (order_id, food_id, quantity, price, subtotal, note)
    VALUES (v_order_id, 5, 1, 55000, 55000, 'Tới sảnh gọi nhé, đang dở ván rank Liên Minh');

    INSERT INTO payments (order_id, type, amount, status)
    VALUES (v_order_id, 'cod', 55000, 'unpaid');

    -- 2. Đơn hàng ONGOING (Trạng thái: delivering)
    INSERT INTO orders (user_id, status, delivery_address, created_at)
    VALUES (v_user_id, 'delivering', 'KTX Khu B, Dĩ An', NOW() - INTERVAL '1 hour')
    RETURNING id INTO v_order_id;

    INSERT INTO order_details (order_id, food_id, quantity, price, subtotal)
    VALUES 
        (v_order_id, 4, 2, 40000, 80000),
        (v_order_id, 3, 2, 15000, 30000);

    INSERT INTO payments (order_id, type, amount, status)
    VALUES (v_order_id, 'banking', 110000, 'paid');

    -- 3. Đơn hàng HISTORY (Trạng thái: completed)
    INSERT INTO orders (user_id, status, delivery_address, created_at)
    VALUES (v_user_id, 'completed', 'KTX Khu B, Dĩ An', NOW() - INTERVAL '2 days')
    RETURNING id INTO v_order_id;

    INSERT INTO order_details (order_id, food_id, quantity, price, subtotal, note)
    VALUES (v_order_id, 6, 1, 45000, 45000, 'Giao nhanh nha shop, chuẩn bị chạy deadline đồ án');

    INSERT INTO payments (order_id, type, amount, status, paid_at)
    VALUES (v_order_id, 'momo', 45000, 'paid', NOW() - INTERVAL '2 days');

    -- 4. Đơn hàng HISTORY (Trạng thái: canceled)
    INSERT INTO orders (user_id, status, delivery_address, created_at)
    VALUES (v_user_id, 'canceled', 'KTX Khu B, Dĩ An', NOW() - INTERVAL '5 days')
    RETURNING id INTO v_order_id;

    INSERT INTO order_details (order_id, food_id, quantity, price, subtotal)
    VALUES (v_order_id, 5, 1, 55000, 55000);

    INSERT INTO payments (order_id, type, amount, status)
    VALUES (v_order_id, 'cod', 55000, 'failed');

END $$;