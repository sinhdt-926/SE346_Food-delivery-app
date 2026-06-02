export interface CartItem {
  id: number;
  quantity: number;
  food_id: number;
  foods: food;
}
//tách riêng để dễ sử dụng
export interface food {
  id: string;
  name: string;
  price: number;
  image_url: string;
  is_available: boolean;
  //thêm loại của món ăn
  category_name?: string;
  description?: string;
  category_id?: number;
}
export type MenuStatus = "all" | string;

export interface Category {
  id: number;
  category_name: string;
}
