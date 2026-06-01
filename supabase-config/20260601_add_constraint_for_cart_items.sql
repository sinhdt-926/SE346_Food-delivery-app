ALTER TABLE cart_items 
ADD CONSTRAINT unique_cart_food UNIQUE (cart_id, food_id);