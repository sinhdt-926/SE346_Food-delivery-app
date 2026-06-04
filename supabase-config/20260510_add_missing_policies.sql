-- 1. Bổ sung policy cho bảng promotions và promotion_food
-- Cho phép mọi người (kể cả chưa đăng nhập) xem danh sách khuyến mãi
CREATE POLICY "Public xem promotions" ON promotions FOR SELECT TO public USING (true);
CREATE POLICY "Public xem promotion_food" ON promotion_food FOR SELECT TO public USING (true);

-- Cho phép owner toàn quyền thêm, sửa, xóa khuyến mãi
CREATE POLICY "Owner quan ly promotions" ON promotions FOR ALL TO authenticated USING (get_current_user_role() = 'owner');
CREATE POLICY "Owner quan ly promotion_food" ON promotion_food FOR ALL TO authenticated USING (get_current_user_role() = 'owner');

-- 2. Bổ sung policy cho bảng payments
-- Owner xem tất cả thanh toán, Khách chỉ xem thanh toán của đơn hàng mình
CREATE POLICY "Owner xem tat ca thanh toan" ON payments FOR SELECT TO authenticated USING (get_current_user_role() = 'owner');
CREATE POLICY "Khach hang xem thanh toan cua minh" ON payments FOR SELECT TO authenticated USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Khách hàng chỉ được insert thanh toán cho đơn hàng của mình
CREATE POLICY "Khach hang tao thanh toan" ON payments FOR INSERT TO authenticated WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Cập nhật thanh toán (VD: webhook từ cổng thanh toán hoặc owner update thủ công)
CREATE POLICY "Owner cap nhat thanh toan" ON payments FOR UPDATE TO authenticated USING (get_current_user_role() = 'owner');


-- 3. Bổ sung các policy cho các bảng còn thiếu
-- categories và foods: Bổ sung quyền thao tác cho Owner
CREATE POLICY "Owner quan ly categories" ON categories FOR ALL TO authenticated USING (get_current_user_role() = 'owner');
CREATE POLICY "Owner quan ly foods" ON foods FOR ALL TO authenticated USING (get_current_user_role() = 'owner');

-- users: Bổ sung quyền cho user cập nhật profile của chính họ
CREATE POLICY "Nguoi dung tu cap nhat profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- orders: Bổ sung quyền tạo, xem đơn cho Khách hàng và cập nhật đơn cho Owner
CREATE POLICY "Khach hang tao don hang" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- order_details: Bổ sung quyền chèn chi tiết đơn hàng cho Khách hàng
CREATE POLICY "Khach hang them chi tiet don" ON order_details FOR INSERT TO authenticated WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));