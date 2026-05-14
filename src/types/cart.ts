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
  type: FoodType;
  description?: string;
  category_id?: number;
}
export type MenuStatus = "all" | FoodType;

export type FoodType = "pizza" | "burger" | "chicken" | "dessert" | "drink";

export const FOOD_TYPE_LABELS: Record<FoodType, string> = {
  pizza: "Pizza",
  burger: "Burger",
  chicken: "Chicken",
  dessert: "Dessert",
  drink: "Drink",
};
