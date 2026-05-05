export type Food = {
  id: number;
  name: string;
  image_url: string | null;
  price: number;
  rating?: number;
  category?: string;
  is_available: boolean;
};
