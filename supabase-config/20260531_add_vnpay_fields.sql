-- Migration: Thêm các trường phục vụ tích hợp thanh toán VNPAY vào bảng payments

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS transaction_no character varying NULL,
  ADD COLUMN IF NOT EXISTS bank_code character varying NULL,
  ADD COLUMN IF NOT EXISTS vnp_response_code character varying NULL,
  ADD COLUMN IF NOT EXISTS raw_response jsonb NULL;