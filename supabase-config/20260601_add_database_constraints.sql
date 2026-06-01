-- Thêm các ràng buộc toàn vẹn cơ bản

-- Bảng users
ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('customer', 'owner')); -- Ràng buộc role là customer (khách hàng) hoặc owner (chủ cửa hàng)
ALTER TABLE users ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'); -- Ràng buộc định dạng email cơ bản
ALTER TABLE users ADD CONSTRAINT check_phone_format CHECK (phone_number ~ '^(0|84|[+]84)(3|5|7|8|9)[0-9]{8}$'); -- Ràng buộc định dạng số điện thoại Việt Nam

-- Bảng foods
ALTER TABLE foods ADD CONSTRAINT check_food_name_not_empty CHECK (TRIM(name) <> ''); -- Ràng buộc tên món không được rỗng
ALTER TABLE foods ADD CONSTRAINT check_food_price_positive CHECK (price >= 0); -- Ràng buộc giá không âm

-- Bảng categories
ALTER TABLE categories ADD CONSTRAINT check_category_name_not_empty CHECK (TRIM(category_name) <> ''); -- Ràng buộc tên danh mục không được rỗng

-- Bảng promotions
ALTER TABLE promotions ADD CONSTRAINT check_discount_type CHECK (discount_type IN ('percent', 'fixed')); -- Ràng buộc loại giảm giá là percent (phần trăm) hoặc fixed (số tiền cố định)
ALTER TABLE promotions ADD CONSTRAINT check_discount_value CHECK (
  discount_value > 0 AND (discount_type != 'percent' OR discount_value <= 100)
); -- Ràng buộc giá trị giảm giá lớn hơn 0 và nhỏ hơn hoặc bằng 100 nếu là phần trăm
ALTER TABLE promotions ADD CONSTRAINT check_promotion_dates CHECK (end_date > start_date); -- Ràng buộc ngày kết thúc phải sau ngày bắt đầu

-- Bảng cart_items
ALTER TABLE cart_items ADD CONSTRAINT check_cart_qty CHECK (quantity > 0); -- Ràng buộc số lượng không âm

-- Bảng order_details
ALTER TABLE order_details ADD CONSTRAINT check_order_qty CHECK (quantity > 0); -- Ràng buộc số lượng không âm
ALTER TABLE order_details ADD CONSTRAINT check_order_price CHECK (price >= 0 AND subtotal >= 0); -- Ràng buộc giá không âm

-- Bảng payments
ALTER TABLE payments ADD CONSTRAINT check_payment_amount CHECK (amount >= 0); -- Ràng buộc số tiền không âm

-- Enum Status (Trạng thái)
ALTER TABLE orders ADD CONSTRAINT check_order_status CHECK (status IN ('pending', 'preparing', 'delivering', 'completed', 'cancelled')); -- Ràng buộc trạng thái đơn hàng
ALTER TABLE payments ADD CONSTRAINT check_payment_status CHECK (status IN ('unpaid', 'paid', 'cancelled')); -- Ràng buộc trạng thái thanh toán
