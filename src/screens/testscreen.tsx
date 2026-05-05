import { View } from "react-native";
import { useState } from "react";
import CardFoodComponentSmall from "../components/FoodCardSmall";
import { CardFood } from "../types/cardfood";

export default function TestScreen() {
  const fakeData: CardFood[] = [
    {
      id: 1,
      food: {
        id: 1,
        name: "Pizza",
        image_url: "https://via.placeholder.com/150",
        price: 100000,
      },
    },
    {
      id: 2,
      food: {
        id: 2,
        name: "Burger",
        image_url: "https://via.placeholder.com/150",
        price: 80000,
      },
    },
  ];

  const [foods] = useState<CardFood[]>(fakeData);

  const handleChoose = (item: CardFood) => {
    console.log("Choose:", item);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 12,
      }}
    >
      {foods.map((item) => (
        <CardFoodComponentSmall
          key={item.id}
          item={item}
          onChoose={handleChoose}
        />
      ))}
    </View>
  );
}
