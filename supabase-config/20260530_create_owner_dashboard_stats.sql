-- Tạo function thống kê doanh thu và đơn hàng cho Owner
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

    -- 1. Tổng doanh thu (tổng các payment đã thanh toán thành công trong khoảng thời gian)
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

    -- 4. Số đơn hàng đã hủy (chấp nhận cả 'cancelled' và 'canceled')
    SELECT COUNT(*) INTO v_cancelled_orders
    FROM orders o
    WHERE o.status IN ('cancelled', 'canceled') AND o.created_at BETWEEN v_start AND v_end;

    -- 5. Số lượng món ăn đang hoạt động (active menu items)
    SELECT COUNT(*) INTO v_active_menu_items
    FROM foods f
    WHERE f.is_available = true;

    -- 6. Doanh thu và số lượng đơn hàng theo ngày
    SELECT COALESCE(JSON_AGG(t), '[]'::json) INTO v_revenue_by_date
    FROM (
        SELECT 
            TO_CHAR(o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') AS date,
            SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) AS revenue,
            COUNT(DISTINCT o.id) AS order_count
        FROM orders o
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.created_at BETWEEN v_start AND v_end
        GROUP BY TO_CHAR(o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD')
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
