import { View, ScrollView } from "react-native";
import FoodCardDetail from "../components/FoodCartDetails";
import { Food } from "../types/food";
import CustomButton from "../components/CustomButton";

export default function TestScreen() {
  const fakeData: Food[] = [
    {
      id: 1,
      name: "Chicken Thai Biriyani",
      image_url: "https://via.placeholder.com/150",
      price: 60,
      rating: 4.9,
      category: "Breakfast",
      is_available: true,
    },
    {
      id: 2,
      name: "Buffalo Burgers",
      image_url: "https://via.placeholder.com/150",
      price: 75,
      rating: 4.7,
      category: "Fast Food",
      is_available: true,
    },
    {
      id: 3,
      name: "Pizza Pepperoni",
      image_url: "https://via.placeholder.com/150",
      price: 90,
      rating: 4.8,
      category: "Dinner",
      is_available: true,
    },
  ];

  const handlePress = (item: Food) => {
    console.log("Pressed:", item);
  };

  const handleClick = () => {
    console.log("Button clicked");
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CustomButton title="Small" size="small" onPress={() => {}} />
      <CustomButton title="Medium" onPress={() => {}} />
      <CustomButton title="Large" size="large" onPress={() => {}} />
    </View>
  );
}
