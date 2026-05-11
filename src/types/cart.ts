export interface CartItem {
  id: number;
  quantity: number;
  food_id: number;
  foods: food;
}
//tách riêng để dễ sử dụng
export interface food {
  id: number;
  name: string;
  price: number;
  image_url: string;
  is_available: boolean;
  //thêm loại của món ăn
  type: string;
}
export type MenuStatus = "all" | "fastfood" | "dessert" | "drink";
