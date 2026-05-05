import { View } from "react-native";
import { useState } from "react";
import CartItemComponent from "../components/CartItem";
import { CartItem } from "../types/cartitem";

export default function TestScreen() {
  const fakeItem: CartItem = {
    id: 1,
    quantity: 2,
    food: {
      id: 1,
      name: "Pizza",
      image_url: "https://via.placeholder.com/150",
      price: 100000,
    },
  };

  const [cart, setCart] = useState<CartItem[]>([fakeItem]);

  const handleIncrease = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const handleDecrease = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };

  const handleDelete = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <View style={{ padding: 20 }}>
      {cart.map((item) => (
        <CartItemComponent
          key={item.id}
          item={item}
          onDelete={handleDelete}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
        />
      ))}
    </View>
  );
}
