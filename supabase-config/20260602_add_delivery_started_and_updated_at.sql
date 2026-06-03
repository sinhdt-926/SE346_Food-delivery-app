-- 1. Thêm cột lưu thời điểm bắt đầu giao hàng (Chỉ ghi 1 lần duy nhất)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_started_at TIMESTAMP WITH TIME ZONE;

-- 2. Thêm cột lưu thời điểm cập nhật cuối cùng
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Tạo Trigger tự động cập nhật cột updated_at mỗi khi có thay đổi trên dòng (Row)
-- Yêu cầu extension moddatetime phải được bật
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

DROP TRIGGER IF EXISTS handle_orders_updated_at ON public.orders;

CREATE TRIGGER handle_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);