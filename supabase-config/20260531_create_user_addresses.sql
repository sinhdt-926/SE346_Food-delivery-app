-- Tạo bảng lưu nhiều địa chỉ của người dùng
CREATE TABLE IF NOT EXISTS user_addresses (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label       TEXT NOT NULL DEFAULT 'Khác', -- 'Nhà', 'Cơ quan', 'Khác'
    address     TEXT NOT NULL,
    latitude    FLOAT8,
    longitude   FLOAT8,
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bật Row Level Security
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Chỉ user đang đăng nhập mới thấy địa chỉ của mình
CREATE POLICY "User xem dia chi cua minh"
ON user_addresses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- User chỉ được thêm địa chỉ cho chính mình
CREATE POLICY "User them dia chi"
ON user_addresses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- User chỉ được sửa địa chỉ của mình
CREATE POLICY "User sua dia chi cua minh"
ON user_addresses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- User chỉ được xóa địa chỉ của mình
CREATE POLICY "User xoa dia chi cua minh"
ON user_addresses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Tạo hàm đảm bảo chỉ có 1 địa chỉ mặc định mỗi user (Trigger)
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu địa chỉ mới được đặt là mặc định, bỏ mặc định tất cả địa chỉ còn lại của user đó
    IF NEW.is_default = TRUE THEN
        UPDATE user_addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;

        -- Đồng bộ địa chỉ mặc định vào cột address của bảng users
        UPDATE users
        SET address = NEW.address
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_ensure_single_default_address
AFTER INSERT OR UPDATE ON user_addresses
FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();
