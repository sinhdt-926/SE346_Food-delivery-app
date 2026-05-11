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
  type: "pizza" | "dessert" | "drink" | "burger" | "chicken";
}
export type MenuStatus =
  | "all"
  | "pizza"
  | "burger"
  | "chicken"
  | "dessert"
  | "drink";
