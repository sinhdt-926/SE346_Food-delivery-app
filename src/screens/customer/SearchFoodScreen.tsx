import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../../components/BackButton";
import CustomInput from "../../components/CustomInput";
import HomeFoodCard from "../../components/HomeFoodCard";
import { searchFoods } from "../../services/food.service";
import { getValidPromotions, applyPromotion } from "../../services/promotion.service";
import { useCartStore } from "../../store/useCartStore";
import Toast from "react-native-toast-message";

export default function SearchFoodScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredFoods, setFilteredFoods] = useState<any[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);
  const { addToCart } = useCartStore();

  // Dùng useRef + setTimeout để tự implement debounce, không cần thư viện ngoài
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFoods([]);
      return;
    }
    // Xóa timer cũ nếu có
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    // Đặt timer mới 400ms
    debounceTimerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchFoods(searchQuery.trim());
        setFilteredFoods(results || []);
      } catch (error) {
        console.log("Lỗi khi tìm kiếm món ăn:", error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

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

  const handleSearch = () => {
    // Implement search logic later
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.header}>
            <BackButton style={{ marginRight: 15 }} />
            <CustomInput
              containerStyle={{ flex: 1, marginBottom: 0 }}
              iconName="search"
              placeholder="Tìm món ăn, nhà hàng..."
              autoFocus={true}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              rightElement={
                searchQuery.length > 0 ? (
                  <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={18} color="#A0A5BA" />
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF7622" />
              </View>
            ) : searchQuery.length === 0 ? (
              <View style={styles.centerContainer}>
                <Ionicons name="search-outline" size={80} color="#E0E4F0" />
                <Text style={styles.placeholderText}>
                  Nhập tên món ăn bạn muốn tìm kiếm
                </Text>
              </View>
            ) : filteredFoods.length === 0 ? (
              <View style={styles.centerContainer}>
                <Ionicons name="fast-food-outline" size={80} color="#E0E4F0" />
                <Text style={styles.placeholderText}>
                  Không tìm thấy món ăn nào phù hợp
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredFoods}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 15 }}
                keyboardShouldPersistTaps="handled"
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
  container: { flex: 1, backgroundColor: "#FFF" },
  inner: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F5FA",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 20,
    fontSize: 16,
    color: "#A0A5BA",
  },
});
