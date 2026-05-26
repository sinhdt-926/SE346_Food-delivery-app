import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import TopTabButton from "../../components/TopTabButton";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MenuStatus, food } from "../../types/cart";
import FoodCard from "../../components/FoodCard";
import { getAllFoods } from "../../services/food.service";
import CustomButton from "../../components/CustomButton";

export default function ManagerMenuScreen() {
  const [activeTab, setActiveTab] = useState<MenuStatus>("all");
  const [foods, setFoods] = useState<food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const filteredFood = useMemo(() => {
    if (activeTab === "all") {
      return foods;
    }
    return foods.filter(
      (item) => item.category_name?.toLowerCase() === activeTab.toLowerCase(),
    );
  }, [foods, activeTab]);
  const isFlag = useRef(true);
  //set cờ để kiểm tra người dùng vẫn còn trong màn hình
  const fetchFoods = async () => {
    try {
      if (foods.length === 0) {
        setLoading(true);
      }
      setError("");
      const data = await getAllFoods();
      const formattedFoods = data.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image_url: item.image_url,
        is_available: item.is_available,
        description: item.description,
        category_id: item.category_id,
        category_name: item.categories?.category_name ?? "Unknown",
      }));

      if (isFlag.current) {
        setFoods(formattedFoods);
      }
    } catch (error) {
      if (isFlag.current) {
        setError("Không thể tải danh sách món ăn");
      }
    } finally {
      if (isFlag.current) {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    fetchFoods();
    return () => {
      isFlag.current = false;
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
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await getAllFoods();
      console.log(JSON.stringify(data, null, 2));
      const formattedFoods = data.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image_url: item.image_url,
        is_available: item.is_available,
        description: item.description,
        category_id: item.category_id,
        category_name: item.categories?.category_name ?? "Unknown",
      }));
      if (isFlag.current) {
        setFoods(formattedFoods);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải lại", [
        {
          text: "Thử lại",
          onPress: () => handleRefresh(),
        },
      ]);
    } finally {
      if (isFlag.current) {
        setRefreshing(false);
      }
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>

      {/* tab */}
      <View style={styles.tabs}>
        <TopTabButton
          iconName="grid-outline"
          active={activeTab === "all"}
          onPress={() => setActiveTab("all")}
        />

        <TopTabButton
          iconName="pizza"
          active={activeTab === "pizza"}
          onPress={() => setActiveTab("pizza")}
        />

        <TopTabButton
          iconName="hamburger"
          iconType="material"
          active={activeTab === "burger"}
          onPress={() => setActiveTab("burger")}
        />

        <TopTabButton
          iconName="food-turkey"
          iconType="material"
          active={activeTab === "chicken"}
          onPress={() => setActiveTab("chicken")}
        />

        <TopTabButton
          iconName="ice-cream"
          active={activeTab === "dessert"}
          onPress={() => setActiveTab("dessert")}
        />

        <TopTabButton
          iconName="wine"
          active={activeTab === "drink"}
          onPress={() => setActiveTab("drink")}
        />
      </View>

      {/* tính tổng số món ăn cho từng loại */}
      <View style={styles.subContainer}>
        <Text style={styles.countText}>{filteredFood.length} items</Text>
        {/* add */}
        <View style={styles.actionButtons}>
          {/* add */}
          <CustomButton
            iconName="add"
            iconType="ion"
            iconColor="white"
            onPress={() => navigation.navigate("AddEditFood" as never)}
            buttonStyle={styles.iconButton}
          />

          {/* refresh */}
          <CustomButton
            iconName="refresh"
            iconType="ion"
            iconColor="white"
            onPress={handleRefresh}
            isLoading={refreshing}
            disabled={refreshing}
            buttonStyle={styles.iconButton}
          />
        </View>
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
            category_name={item.category_name}
            price={item.price}
            image_url={item.image_url}
            is_available={item.is_available}
            onPress={() =>
              navigation.navigate("AddEditFood", {
                food: item,
              })
            }
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
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    marginBottom: 18,
  },

  countText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
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

  subContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    paddingVertical: 0,
  },
});
