import { supabase } from "./supabase";

//Category
export const getCategories = async () => {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) {
    throw error;
  }
  return data;
};

export const createCategory = async (name: string) => {
  const { data, error } = await supabase
    .from("categories")
    .insert([{ category_name: name }])
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
};

export const updateCategory = async (id: number, name: string) => {
  const { data, error } = await supabase
    .from("categories")
    .update({ category_name: name })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
};

export const deleteCategory = async (id: number) => {
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);
  if (error) {
    throw error;
  }
  return true;
};

//Food
export const getFoods = async () => {
  const { data, error } = await supabase
    .from("foods")
    .select("*, categories(id, category_name)")
    .eq("is_available", true);

  if (error) {
    throw error;
  }
  return data;
};

export const getFoodsByCategory = async (category_id: number) => {
  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .eq("category_id", category_id)
    .eq("is_available", true);
  if (error) {
    throw error;
  }
  return data;
};

export const createFood = async (food: {
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  category_id: number;
}) => {
  const { data, error } = await supabase
    .from("foods")
    .insert([{ ...food, is_available: true }])
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
};

export const updateFood = async (
  id: number,
  food: {
    name?: string;
    price?: number;
    description?: string;
    image_url?: string;
    category_id?: number;
    is_available?: boolean;
  },
) => {
  const { data, error } = await supabase
    .from("foods")
    .update(food)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
};

export const deleteFood = async (id: number) => {
  const { data, error } = await supabase.from("foods").delete().eq("id", id);
  if (error) {
    throw error;
  }
  return true;
};

//Image
export const uploadImage = async (file: any) => {
  const fileName = `foods/food-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      contentType: "image/jpeg",
    });
  if (error) {
    throw error;
  }
  const { data } = await supabase.storage.from("images").getPublicUrl(fileName);
  return data.publicUrl;
};
