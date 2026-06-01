import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getFoodById } from "../../services/food.service";
import { applyPromotion } from "../../services/promotion.service";
import { useCartStore } from "../../store/useCartStore";
import Toast from "react-native-toast-message";
import CustomHeader from "../../components/CustomHeader";

export default function FoodDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [food, setFood] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const data = await getFoodById(id);
        setFood(data);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể tải thông tin món ăn",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [id]);

  const handleAddToCart = async () => {
    if (addingToCart) return;
    setAddingToCart(true);
    try {
      await addToCart(id, 1);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã thêm món ăn vào giỏ hàng",
        visibilityTime: 2000,
        topOffset: 60,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error?.message || "Không thể thêm vào giỏ hàng",
        visibilityTime: 2000,
        topOffset: 60,
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <CustomHeader title="Chi tiết món ăn" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      </SafeAreaView>
    );
  }

  if (!food) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <CustomHeader title="Chi tiết món ăn" />
        <View style={styles.center}>
          <Text style={{ color: "#646982" }}>Món ăn không tồn tại</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Lấy khuyến mãi đầu tiên đang hoạt động (nếu có)
  let promo = null;
  if (food.promotion_food && food.promotion_food.length > 0) {
    const activePromotions = food.promotion_food
      .map((pf: any) => pf.promotions)
      .filter((p: any) => p && p.is_active);
    if (activePromotions.length > 0) {
      promo = activePromotions[0];
    }
  }

  const finalPrice = promo ? applyPromotion(food.price, promo) : food.price;

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: food.image_url || "https://via.placeholder.com/400" }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{food.name}</Text>
          </View>

          <View style={styles.categoryRow}>
            <Ionicons name="fast-food-outline" size={16} color="#FF7622" />
            <Text style={styles.categoryText}>
              {food.categories?.category_name || "Không có danh mục"}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{finalPrice.toLocaleString()}đ</Text>
            {promo && (
              <Text style={styles.originalPrice}>{food.price.toLocaleString()}đ</Text>
            )}
          </View>

          {promo && (
            <View style={styles.promoBadge}>
              <Text style={styles.promoText}>
                Đang giảm giá: {promo.name}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>
            {food.description || "Không có mô tả cho món ăn này."}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addToCartButton, !food.is_available && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={!food.is_available || addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.addToCartText}>
              {food.is_available ? "THÊM VÀO GIỎ HÀNG" : "HẾT MÓN"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F5F9" },
  loadingContainer: { flex: 1, backgroundColor: "#F4F5F9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { paddingBottom: 100 },
  image: { width: "100%", height: 250 },
  detailsContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 24,
    minHeight: 500,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#1E1E1E", flex: 1 },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  categoryText: { color: "#A0A5BA", fontSize: 14 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  price: { fontSize: 24, fontWeight: "bold", color: "#FF7622" },
  originalPrice: { fontSize: 16, color: "#A0A5BA", textDecorationLine: "line-through" },
  promoBadge: {
    backgroundColor: "#FFEBEB",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  promoText: { color: "#EB5757", fontSize: 12, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F0F5FA", marginVertical: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1E1E1E", marginBottom: 12 },
  description: { fontSize: 14, color: "#646982", lineHeight: 22 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F5FA",
  },
  addToCartButton: {
    backgroundColor: "#FF8A00",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#BDBDBD",
  },
  addToCartText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
