-- 1. Thêm ràng buộc cho trường type của bảng payments chỉ cho phép nhận giá trị là cash và vnpay
ALTER TABLE payments
ADD CONSTRAINT payments_type_check CHECK (type IN ('cash', 'vnpay'));

-- 2. Thêm image_url cho bảng users và promotions
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS image_url VARCHAR;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS image_url VARCHAR;

-- 3. Cập nhật trigger function handle_new_user để lưu image_url
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, fullname, email, image_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'fullname',
    new.email,
    COALESCE(
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url;
  RETURN new;
END;
$$;

-- 4. Thêm function và trigger để cập nhật status của bảng payments khi order chuyển sang completed
CREATE OR REPLACE FUNCTION update_payment_on_order_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Chỉ chạy update nếu trạng thái order thay đổi từ 'delivering' thành 'completed'
  IF NEW.status = 'completed' AND OLD.status = 'delivering' THEN
    UPDATE payments 
    SET status = 'paid', paid_at = NOW()
    WHERE order_id = NEW.id AND type = 'cash' AND status = 'unpaid';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_payment_on_order_complete ON orders;
CREATE TRIGGER trigger_update_payment_on_order_complete
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE PROCEDURE update_payment_on_order_complete();
