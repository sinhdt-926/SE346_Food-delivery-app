CREATE OR REPLACE FUNCTION add_to_cart(
    p_cart_id  INT,
    p_food_id  INT,
    p_quantity INT
)
RETURNS SETOF cart_items
LANGUAGE plpgsql
SECURITY DEFINER               -- chạy với quyền owner để bypass RLS an toàn
SET search_path = public
AS $$
BEGIN
    -- Kiểm tra xem cart có đang thuộc về user đang gọi không
    IF NOT EXISTS (
    SELECT 1 FROM carts
    WHERE id = p_cart_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Không có quyền truy cập giỏ hàng này';
    END IF;
    RETURN QUERY
    INSERT INTO cart_items (cart_id, food_id, quantity)
    VALUES (p_cart_id, p_food_id, p_quantity)
    ON CONFLICT (cart_id, food_id)          -- đụng unique constraint →
    DO UPDATE
        SET quantity = cart_items.quantity + EXCLUDED.quantity  -- cộng dồn atomic
    RETURNING *;
END;
$$;