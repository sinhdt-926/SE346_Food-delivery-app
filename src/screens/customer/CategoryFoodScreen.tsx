import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  getCategories,
  getFoodsByCategory,
  getAllFoods,
} from "../../services/food.service";
import {
  getValidPromotions,
  applyPromotion,
} from "../../services/promotion.service";
import HomeFoodCard from "../../components/HomeFoodCard";
import BackButton from "../../components/BackButton";
import { useCartStore } from "../../store/useCartStore";

const { height } = Dimensions.get("window");

export default function CategoryFoodScreen({ navigation, route }: any) {
  const initialCategoryId = route.params?.category_id ?? null;
  const initialCategoryName = route.params?.category_name ?? "Tất cả";

  const { addToCart } = useCartStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState({
    id: initialCategoryId,
    name: initialCategoryName,
  });
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFoods(selectedCategory.id);
  }, [selectedCategory.id]);

  const fetchInitialData = async () => {
    try {
      const [catsData, promosData] = await Promise.all([
        getCategories(),
        getValidPromotions(),
      ]);
      // Thêm option Tất cả lên đầu
      setCategories([{ id: null, category_name: "Tất cả" }, ...(catsData || [])]);
      setPromotions(promosData || []);
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  const fetchFoods = async (categoryId: number | null) => {
    setLoading(true);
    try {
      let foodsData = [];
      if (categoryId) {
        foodsData = await getFoodsByCategory(categoryId);
      } else {
        foodsData = await getAllFoods();
      }
      // getAllFoods returns without is_available filter, we might need to filter manually or API should do it.
      // Assuming getFoodsByCategory only returns is_available=true as updated.
      // getAllFoods should also ideally filter or we filter here.
      const availableFoods = (foodsData || []).filter((f: any) => f.is_available);
      setFoods(availableFoods);
    } catch (error) {
      console.log("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (food: any) => {
    setAddingId(food.id);
    try {
      await addToCart(food.id, 1);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Đã thêm ${food.name} vào giỏ hàng`,
        visibilityTime: 2000,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error?.message || "Không thể thêm vào giỏ hàng",
        visibilityTime: 2000,
      });
    } finally {
      setAddingId(null);
    }
  };

  const getFoodPromo = (food: any) => {
    if (food.promotion_food && food.promotion_food.length > 0) {
      const activePromotions = food.promotion_food
        .map((pf: any) => pf.promotions)
        .filter((p: any) => p && p.is_active);
      if (activePromotions.length > 0) {
        return activePromotions[0];
      }
    }
    return null;
  };

  const selectCategory = (item: any) => {
    setSelectedCategory({ id: item.id, name: item.category_name });
    setIsDropdownVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <TouchableWithoutFeedback onPress={() => isDropdownVisible && setIsDropdownVisible(false)}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <BackButton />

              {/* Custom Dropdown Button */}
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setIsDropdownVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownBtnText} numberOfLines={1}>
                  {selectedCategory.name.toUpperCase()}
                </Text>
                <Ionicons name="caret-down" size={16} color="#FF7622" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => navigation.navigate("SearchFood")}
            >
              <Ionicons name="search" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Absolute Dropdown Modal */}
          {isDropdownVisible && (
            <View style={styles.dropdownListContainer}>
              <FlatList
                data={categories}
                keyExtractor={(item) => (item.id ? item.id.toString() : "all")}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      selectedCategory.id === item.id && styles.dropdownItemSelected,
                    ]}
                    onPress={() => selectCategory(item)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedCategory.id === item.id &&
                        styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item.category_name}
                    </Text>
                    {selectedCategory.id === item.id && (
                      <Ionicons name="checkmark" size={20} color="#FF7622" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF7622" />
              </View>
            ) : foods.length === 0 ? (
              <View style={styles.centerContainer}>
                <Ionicons name="fast-food-outline" size={60} color="#D0D4E4" />
                <Text style={styles.emptyText}>Chưa có món ăn nào trong thể loại này</Text>
              </View>
            ) : (
              <FlatList
                data={foods}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => {
                  const promo = getFoodPromo(item);
                  const finalPrice = promo
                    ? applyPromotion(item.price, promo)
                    : item.price;

                  return (
                    <HomeFoodCard
                      food={item}
                      finalPrice={finalPrice}
                      promo={promo}
                      addingId={addingId}
                      onPress={() =>
                        navigation.navigate("FoodDetail", { id: item.id })
                      }
                      onAddToCart={handleAddToCart}
                    />
                  );
                }}
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#F8F9FB",
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 12, // Cách nút back một khoảng nhỏ
    backgroundColor: "#FFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#181C2E",
    marginRight: 6,
    letterSpacing: 0.5,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#A0A5BA",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 15,
    fontSize: 15,
    color: "#A0A5BA",
    textAlign: "center",
  },

  // Absolute Dropdown Styles
  dropdownListContainer: {
    position: "absolute",
    top: 65,
    left: 71, // 15 (padding header) + 44 (nút back) + 12 (margin left dropdown)
    width: 180, // Thu hẹp chiều rộng của list
    backgroundColor: "#FFF",
    borderRadius: 16,
    maxHeight: height * 0.4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 20,
    borderWidth: 1,
    borderColor: "#F0F5FA",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F5FA",
  },
  dropdownItemSelected: {
    backgroundColor: "#FFF0E6",
  },
  dropdownItemText: {
    fontSize: 12,
    color: "#32343E",
    fontWeight: "500",
  },
  dropdownItemTextSelected: {
    color: "#FF7622",
    fontWeight: "bold",
  },
});
