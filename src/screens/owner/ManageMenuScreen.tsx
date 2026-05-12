import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import TopTabButton from "../../components/TopTabButton";
import { useNavigation } from "@react-navigation/native";
import { MenuStatus } from "../../types/cart";
import { food } from "../../types/cart";
import FoodCard from "../../components/FoodCard";
import { getFoods } from "../../services/food.service";
import CustomButton from "../../components/CustomButton";

export default function ManagerMenuScreen() {
  const [activeTab, setActiveTab] = useState<MenuStatus>("all");
  const [foods, setFoods] = useState<food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const filteredFood = useMemo(() => {
    return activeTab === "all"
      ? foods
      : foods.filter((item) => item.type === activeTab);
  }, [foods, activeTab]);
  //set cờ để kiểm tra người dùng vẫn còn trong màn hình
  const fetchFoods = async (isFlag = true) => {
    try {
      setLoading(true);
      setError("");

      const data = await getFoods();
      if (!isFlag) return;
      const formattedFoods = data.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image_url: item.image_url,
        is_available: item.is_available,
        type: item.categories?.category_name?.toLowerCase() ?? "pizza",
      }));

      setFoods(formattedFoods);
    } catch (error) {
      if (isFlag) setError("Không thể tải danh sách món ăn");
    } finally {
      if (isFlag) setLoading(false);
    }
  };
  useEffect(() => {
    let isFlag = true;
    fetchFoods(isFlag);
    return () => {
      isFlag = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF7622" />
        <Text>Đang tải menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <CustomButton
          title="Thử lại"
          onPress={() => fetchFoods()}
          buttonStyle={styles.retryButton}
          textStyle={styles.retryText}
        />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>

      {/* tab */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsWrapper}
        contentContainerStyle={styles.tabs}
      >
        <TopTabButton
          iconName="grid-outline"
          active={activeTab === "all"}
          onPress={() => setActiveTab("all")}
        />

        <TopTabButton
          iconName="pizza-outline"
          active={activeTab === "pizza"}
          onPress={() => setActiveTab("pizza")}
        />

        <TopTabButton
          iconName="fast-food-outline"
          active={activeTab === "burger"}
          onPress={() => setActiveTab("burger")}
        />

        <TopTabButton
          iconName="restaurant-outline"
          active={activeTab === "chicken"}
          onPress={() => setActiveTab("chicken")}
        />

        <TopTabButton
          iconName="ice-cream-outline"
          active={activeTab === "dessert"}
          onPress={() => setActiveTab("dessert")}
        />

        <TopTabButton
          iconName="wine-outline"
          active={activeTab === "drink"}
          onPress={() => setActiveTab("drink")}
        />
      </ScrollView>

      {/* tính tổng số món ăn cho từng loại */}
      <Text style={styles.countText}>{filteredFood.length} items</Text>

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
    paddingBottom: 10,
    gap: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    marginBottom: 18,
  },

  countText: {
    fontSize: 15,
    color: "#7A7A7A",
    marginBottom: 18,
    fontWeight: "500",
  },
  tabsWrapper: {
    maxHeight: 70,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  retryButton: {
    backgroundColor: "#FF7622",
    marginTop: 16,
    width: "50%",
  },

  retryText: {
    color: "white",
    fontSize: 14,
  },

  errorText: {
    fontSize: 16,
    color: "#B1B1B1",
    textAlign: "center",
    marginBottom: 16,
  },
});
