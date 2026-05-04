-- Sửa lại Policy cho bảng orders
-- Xóa policy bị lỗi đệ quy vô hạn
DROP POLICY IF EXISTS "Owner xem tat ca don" ON public.orders;

-- Tạo lại policy mới dùng function get_current_user_role
CREATE POLICY "Owner xem tat ca don" 
ON public.orders FOR SELECT TO authenticated 
USING ( get_current_user_role() = 'owner' );

-- Sửa lại Policy cho bảng order_details
DROP POLICY IF EXISTS "Xem chi tiet don" ON public.order_details;

CREATE POLICY "Xem chi tiet don" 
ON public.order_details FOR SELECT TO authenticated 
USING (
    (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())) 
    OR 
    (get_current_user_role() = 'owner')
);