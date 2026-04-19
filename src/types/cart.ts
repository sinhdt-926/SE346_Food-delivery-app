export interface CartItem {
  id: number;
  quantity: number;
  food_id: number;
  foods: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    is_available: boolean;
  };
}