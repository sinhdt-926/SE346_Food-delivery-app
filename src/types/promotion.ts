export interface Promotion {
  id: number;
  name: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}
