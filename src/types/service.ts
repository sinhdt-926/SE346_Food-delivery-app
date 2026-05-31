// Chuẩn hoá kiểu trả về cho mọi hàm API
export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};
