-- Bổ sung Policy cho phép Khách hàng (Customer) và Chủ quán (Owner) cập nhật đơn hàng

-- 1. Khách hàng chỉ được cập nhật đơn hàng của chính mình (dùng để Huỷ đơn)
CREATE POLICY "Khach hang cap nhat don hang cua minh" 
ON public.orders FOR UPDATE TO authenticated 
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid() AND status = 'cancelled');
