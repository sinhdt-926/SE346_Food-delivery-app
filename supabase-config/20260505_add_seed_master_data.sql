-- 1. Tạo dữ liệu Categories
INSERT INTO categories (id, category_name) VALUES
(1, 'Pizza'),
(2, 'Burger'),
(3, 'Drink'),
(4, 'Chicken'),
(5, 'Ice Cream')
ON CONFLICT (id) DO NOTHING;

-- 2. Tạo dữ liệu Foods
INSERT INTO foods (id, name, image_url, price, description, is_available, category_id) VALUES
(3, 'Coca Cola 330ml', 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png', 15000, 'Cold refreshing drink', TRUE, 3),
(4, 'Crispy Fried Chicken', 'https://cdn-icons-png.flaticon.com/512/3141/3141081.png', 40000, 'Korean • Fried • 15-20 min', TRUE, 4),
(5, 'Rose Garden Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000', 55000, 'Italian • Pizza • 20-30 min', TRUE, 1),
(6, 'Classic Cheese Burger', 'https://cdn-icons-png.flaticon.com/512/706/706918.png', 45000, 'American • Fast food • 10-15 min', TRUE, 2)
ON CONFLICT (id) DO NOTHING;

-- 3. Tạo dữ liệu Khuyến mãi
INSERT INTO promotions (id, name, discount_type, discount_value, start_date, end_date, is_active) VALUES
(3, 'Free Delivery', 'fixed', 10000, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', TRUE),
(4, '10% OFF', 'percent', 10, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Map Khuyến mãi với Món ăn (Pizza được cả 2 khuyến mãi)
INSERT INTO promotion_food (promotion_id, food_id) VALUES
(3, 5), (3, 6), (4, 5)
ON CONFLICT DO NOTHING;

-- Reset sequence id (để các hàm INSERT sau không bị lỗi khóa chính)
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('foods_id_seq', (SELECT MAX(id) FROM foods));
SELECT setval('promotions_id_seq', (SELECT MAX(id) FROM promotions));