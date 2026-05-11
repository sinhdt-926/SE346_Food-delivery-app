import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import TopTabButton from "../../components/TopTabButton";
import { useNavigation } from "@react-navigation/native";
import { MenuStatus } from "../../types/cart";
import { food } from "../../types/cart";
import FoodCard from "../../components/FoodCard";
import { getFoods } from "../../services/food.service";

export default function ManagerMenuScreen() {
  const [activeTab, setActiveTab] = useState<MenuStatus>("all");
  const [foods, setFoods] = useState<food[]>([]);
  const filteredFood =
    activeTab === "all"
      ? foods
      : foods.filter((item) => item.type === activeTab);

  const fetchFoods = async () => {
    try {
      const data = await getFoods();

      const formattedFoods = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image_url: item.image_url,
        is_available: item.is_available,
        type: item.categories?.category_name?.toLowerCase() ?? "fastfood",
      }));

      setFoods(formattedFoods);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchFoods();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>

      {/* tab */}
      <View style={styles.tabs}>
        <TopTabButton
          title="All"
          active={activeTab === "all"}
          onPress={() => setActiveTab("all")}
        />
        <TopTabButton
          title="Fastfood"
          active={activeTab === "fastfood"}
          onPress={() => setActiveTab("fastfood")}
        />
        <TopTabButton
          title="Dessert"
          active={activeTab === "dessert"}
          onPress={() => setActiveTab("dessert")}
        />
        <TopTabButton
          title="Drink"
          active={activeTab === "drink"}
          onPress={() => setActiveTab("drink")}
        />
      </View>

      {/* list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {filteredFood.map((item) => (
          <FoodCard
            key={item.id}
            id={item.id}
            name={item.name}
            type={item.type}
            price={item.price}
            image_url={item.image_url}
            onPress={() => {}}
          />
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: 65,
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 24,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    marginBottom: 24,
  },
});
