ALTER TABLE cart_items ADD CONSTRAINT unique_cart_food UNIQUE (cart_id, food_id);

-- Tạo Policy để user chỉ có quyền thao tác (Xem, Thêm, Sửa, Xoá) trên giỏ hàng của bản thân
CREATE POLICY "Nguoi dung quan ly cart_items cua chinh minh"
ON cart_items
FOR ALL
TO authenticated
USING (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  )
);