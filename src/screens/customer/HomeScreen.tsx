import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../../store/useCartStore";
import { getFoods, getCategories } from "../../services/food.service";
import { getValidPromotions, applyPromotion } from "../../services/promotion.service";
import { LocationService } from "../../services/location.service";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("pizza")) return "🍕";
  if (lowerName.includes("burger")) return "🍔";
  if (lowerName.includes("drink") || lowerName.includes("nước") || lowerName.includes("uống")) return "🥤";
  if (lowerName.includes("chicken") || lowerName.includes("gà")) return "🍗";
  if (lowerName.includes("cơm")) return "🍛";
  if (lowerName.includes("phở") || lowerName.includes("bún")) return "🍜";
  if (lowerName.includes("tráng miệng") || lowerName.includes("bánh")) return "🍰";
  return "🍽️";
};

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { addToCart } = useCartStore();

  const [address, setAddress] = useState("Đang định vị...");
  const [foods, setFoods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Tự động slide Banner Khuyến Mãi
  useEffect(() => {
    if (promotions.length <= 1) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % promotions.length;
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [promotions]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const locationRes = await LocationService.getCurrentLocation();
      const addr = await LocationService.getAddressFromCoords(locationRes.coords);
      setAddress(addr);

      const [foodsData, catsData, promosData] = await Promise.all([
        getFoods(),
        getCategories(),
        getValidPromotions()
      ]);

      setFoods(foodsData || []);
      setCategories(catsData || []);
      setPromotions(promosData || []);
    } catch (error) {
      console.log("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (food: any) => {
    if (!food.is_available) return;
    setAddingId(food.id);
    try {
      await addToCart(food.id, 1);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Đã thêm ${food.name} vào giỏ hàng`,
        visibilityTime: 2000,
        topOffset: 120, // Hiển thị dưới Header
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error?.message || "Không thể thêm vào giỏ hàng",
        visibilityTime: 2000,
        topOffset: 120,
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

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 45],
    outputRange: [0, -45],
    extrapolate: "clamp",
  });

  const addressOpacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FF7622" />
          <Text style={{ marginTop: 10, color: "#A0A5BA" }}>Đang tải thực đơn...</Text>
        </View>
      </View>
    );
  }

  const renderPromoItem = ({ item }: { item: any }) => (
    <View style={styles.promoBanner}>
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>KHUYẾN MÃI HOT 🔥</Text>
        <Text style={styles.promoDesc}>{item.name}</Text>
        <Text style={styles.promoDiscount}>
          Giảm {item.discount_type === 'percent' ? `${item.discount_value}%` : `${item.discount_value.toLocaleString()}đ`}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* =========================================
          ANIMATED HEADER 
      ========================================= */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        {/* Dòng 1: Address (Sẽ bị giấu đi khi cuộn) */}
        <Animated.View style={[styles.addressRow, { opacity: addressOpacity }]}>
          <Ionicons name="location" size={20} color="#FF7622" />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={styles.deliverToLabel}>Giao đến</Text>
            <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
              {address}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#A0A5BA" />
        </Animated.View>

        {/* Dòng 2: Thanh tìm kiếm (Sẽ giữ nguyên (sticky) khi cuộn) */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="#A0A5BA" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm món ăn..."
              placeholderTextColor="#A0A5BA"
            />
          </View>
        </View>
      </Animated.View>


      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 105, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banners Khuyến Mãi (Tự động lướt) */}
        {promotions.length > 0 && (
          <View style={styles.promoSection}>
            <FlatList
              ref={flatListRef}
              data={promotions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPromoItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              getItemLayout={(data, index) => (
                { length: width, offset: width * index, index }
              )}
            />
          </View>
        )}

        {/* Danh Mục (Categories) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh Mục</Text>
          </View>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ gap: 15, paddingHorizontal: 15 }}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.categoryItem,
                  { transform: [{ scale: pressed ? 0.95 : 1 }] }
                ]}
              >
                <View style={styles.categoryIconBox}>
                  <Text style={styles.categoryEmoji}>{getCategoryIcon(item.category_name)}</Text>
                </View>
                <Text style={styles.categoryText}>{item.category_name}</Text>
              </Pressable>
            )}
          />
        </View>

        {/* Danh sách món ăn nổi bật */}
        <View style={[styles.section, { paddingHorizontal: 15 }]}>
          <Text style={styles.sectionTitle}>Món ăn dành cho bạn</Text>
          <View style={styles.foodGrid}>
            {foods.map((food) => {
              const promo = getFoodPromo(food);
              const finalPrice = promo ? applyPromotion(food.price, promo) : food.price;

              return (
                <TouchableOpacity
                  key={food.id}
                  style={styles.foodCard}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate("FoodDetail", { id: food.id })}
                >
                  <View style={styles.foodImgContainer}>
                    <Image
                      source={{ uri: food.image_url || "https://via.placeholder.com/200" }}
                      style={styles.foodImg}
                    />
                    {!food.is_available && (
                      <View style={styles.overlayUnavailable}>
                        <Text style={styles.unavailableText}>HẾT MÓN</Text>
                      </View>
                    )}
                    {promo && (
                      <View style={styles.promoTag}>
                        <Text style={styles.promoTagText}>
                          {promo.discount_type === 'percent' ? `-${promo.discount_value}%` : `-${promo.discount_value / 1000}k`}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName} numberOfLines={1}>{food.name}</Text>
                    <Text style={styles.foodCategory}>{food.categories?.category_name}</Text>

                    <View style={styles.priceRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.foodPrice}>{finalPrice.toLocaleString()}đ</Text>
                        {promo && (
                          <Text style={styles.foodOriginalPrice}>{food.price.toLocaleString()}đ</Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={[styles.addBtn, !food.is_available && { backgroundColor: "#BDBDBD" }]}
                        onPress={() => handleAddToCart(food)}
                        disabled={!food.is_available || addingId === food.id}
                      >
                        {addingId === food.id ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Ionicons name="add" size={20} color="#FFF" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },

  // Header
  headerContainer: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  addressRow: {
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  deliverToLabel: { fontSize: 11, color: "#A0A5BA", fontWeight: "600" },
  addressText: { fontSize: 14, color: "#32343E", fontWeight: "bold" },
  searchRow: {
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    gap: 8,
  },
  searchInput: { flex: 1, color: "#32343E", fontSize: 14 },

  // Promo Banner
  promoSection: { marginTop: 15 },
  promoBanner: {
    width: width - 30, // Chiều rộng bằng khung hình trừ lề
    marginHorizontal: 15,
    height: 120,
    backgroundColor: "#FF7622",
    borderRadius: 12,
    justifyContent: "center",
    padding: 20,
  },
  promoContent: { zIndex: 2 },
  promoTitle: { color: "#FFF", fontSize: 12, fontWeight: "bold", opacity: 0.9 },
  promoDesc: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginTop: 4 },
  promoDiscount: { color: "#FFF", fontSize: 16, marginTop: 4, fontWeight: "600" },

  // Sections
  section: { marginTop: 25 },
  sectionHeader: { paddingHorizontal: 15, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#32343E" },

  // Categories
  categoryItem: { alignItems: "center", gap: 6 },
  categoryIconBox: {
    backgroundColor: "#FFF",
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryEmoji: { fontSize: 28 },
  categoryText: { fontWeight: "600", color: "#646982", fontSize: 12 },

  // Food Grid
  foodGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  foodCard: {
    width: (width - 40) / 2,
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  foodImgContainer: { width: "100%", height: 110, position: "relative" },
  foodImg: { width: "100%", height: "100%", resizeMode: "cover" },
  overlayUnavailable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  unavailableText: { color: "#FFF", fontWeight: "bold", fontSize: 12, letterSpacing: 1 },
  promoTag: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#EB5757",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  promoTagText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  foodInfo: { padding: 10 },
  foodName: { fontSize: 14, fontWeight: "bold", color: "#32343E", marginBottom: 2 },
  foodCategory: { color: "#A0A5BA", fontSize: 11, marginBottom: 6 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  foodPrice: { fontSize: 14, fontWeight: "bold", color: "#FF7622" },
  foodOriginalPrice: { fontSize: 11, color: "#A0A5BA", textDecorationLine: "line-through" },
  addBtn: {
    backgroundColor: "#FF7622",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;