-- Xóa policy cũ gây lỗi đệ quy
DROP POLICY IF EXISTS "Owner xem tat ca profile" ON public.users;

-- Tạo policy mới an toàn, sử dụng function get_current_user_role để bỏ qua RLS
CREATE POLICY "Owner xem tat ca profile" 
ON public.users
FOR SELECT TO authenticated 
USING ( get_current_user_role() = 'owner' );


-- Xóa policy cũ chỉ cho người dùng đã đăng nhập xem thực đơn
DROP POLICY IF EXISTS "Xem food" ON public.foods;

-- Tạo policy mới cho phép tất cả mọi người (kể cả chưa đăng nhập) xem thực đơn
CREATE POLICY "Xem food" 
ON public.foods 
FOR SELECT TO public 
USING (true);