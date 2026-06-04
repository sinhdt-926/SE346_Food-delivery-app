import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCartStore } from "../../store/useCartStore";
import { getFoods, getCategories } from "../../services/food.service";
import { getValidPromotions, applyPromotion } from "../../services/promotion.service";
import { LocationService } from "../../services/location.service";
import Toast from "react-native-toast-message";
import HomeFoodCard from "../../components/HomeFoodCard";

import { useLocationStore } from "../../store/useLocationStore";

const { width } = Dimensions.get("window");

const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("pizza")) return { name: "pizza", color: "#FF7622", bgColor: "#FFF0E6" };
  if (lowerName.includes("cơm")) return { name: "rice", color: "#FF9800", bgColor: "#FFF3E0" };
  if (lowerName.includes("trà") || lowerName.includes("cà phê") || lowerName.includes("coffee") || lowerName.includes("tea")) return { name: "coffee", color: "#795548", bgColor: "#EFEBE9" };
  if (lowerName.includes("soda") || lowerName.includes("cocktail") || lowerName.includes("nước") || lowerName.includes("drink")) return { name: "glass-cocktail", color: "#00BCD4", bgColor: "#E0F7FA" };
  if (lowerName.includes("chicken") || lowerName.includes("gà")) return { name: "food-drumstick", color: "#E91E63", bgColor: "#FCE4EC" };
  if (lowerName.includes("phở") || lowerName.includes("bún") || lowerName.includes("mì") || lowerName.includes("noodle")) return { name: "noodles", color: "#8BC34A", bgColor: "#F1F8E9" };
  if (lowerName.includes("tráng miệng") || lowerName.includes("bánh") || lowerName.includes("dessert")) return { name: "cupcake", color: "#9C27B0", bgColor: "#F3E5F5" };
  if (lowerName.includes("tất cả") || lowerName.includes("all")) return { name: "view-grid", color: "#32343E", bgColor: "#F0F0F0" };
  return { name: "silverware-fork-knife", color: "#607D8B", bgColor: "#ECEFF1" };
};

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { addToCart } = useCartStore();
  const { currentAddress, fetchLocation } = useLocationStore();
  const address = currentAddress || "Đang định vị...";

  const [foods, setFoods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Nếu store chưa có địa chỉ thì mới gọi hàm lấy vị trí (không await để tránh block giao diện)
    if (!currentAddress) {
      fetchLocation();
    }
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
        props: {
          prefix: "Đã thêm ",
          highlight: food.name,
          suffix: " vào giỏ hàng"
        },
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
    <View style={styles.promoBannerContainer}>
      {item.image_url ? (
        <ImageBackground 
          source={{ uri: item.image_url }} 
          style={styles.promoBanner} 
          imageStyle={{ borderRadius: 12 }}
        >
          <View style={styles.promoOverlay} />
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>KHUYẾN MÃI HOT 🔥</Text>
            <Text style={styles.promoDesc}>{item.name}</Text>
            <Text style={styles.promoDiscount}>
              Giảm {item.discount_type === 'percent' ? `${item.discount_value}%` : `${item.discount_value.toLocaleString()}đ`}
            </Text>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.promoBanner, { backgroundColor: "#FF7622" }]}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>KHUYẾN MÃI HOT 🔥</Text>
            <Text style={styles.promoDesc}>{item.name}</Text>
            <Text style={styles.promoDiscount}>
              Giảm {item.discount_type === 'percent' ? `${item.discount_value}%` : `${item.discount_value.toLocaleString()}đ`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>

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
        <Animated.View style={{ opacity: addressOpacity }}>
          <TouchableOpacity
            style={styles.addressRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("MyAddress")}
          >
            <Ionicons name="location" size={20} color="#FF7622" />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={styles.deliverToLabel}>Giao đến</Text>
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
                {address}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#A0A5BA" />
          </TouchableOpacity>
        </Animated.View>

        {/* Dòng 2: Thanh tìm kiếm (Sẽ giữ nguyên (sticky) khi cuộn) */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={styles.searchInputWrapper}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("SearchFood")}
          >
            <Ionicons name="search" size={20} color="#A0A5BA" />
            <Text style={styles.searchInputPlaceholder}>
              Tìm kiếm món ăn...
            </Text>
          </TouchableOpacity>
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
            data={[{ id: null, category_name: 'Tất cả' }, ...categories]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id ? item.id.toString() : 'all'}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 15 }}
            renderItem={({ item }) => {
              const iconData = getCategoryIcon(item.category_name);
              return (
                <Pressable
                  onPress={() => navigation.navigate("CategoryFood", { category_id: item.id, category_name: item.category_name })}
                  style={({ pressed }) => [
                    styles.categoryPill,
                    { transform: [{ scale: pressed ? 0.95 : 1 }] }
                  ]}
                >
                  <View style={[styles.categoryPillIcon, { backgroundColor: iconData.bgColor }]}>
                    <MaterialCommunityIcons name={iconData.name as any} size={20} color={iconData.color} />
                  </View>
                  <Text style={styles.categoryPillText}>{item.category_name}</Text>
                </Pressable>
              );
            }}
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
                <HomeFoodCard
                  key={food.id}
                  food={food}
                  finalPrice={finalPrice}
                  promo={promo}
                  addingId={addingId}
                  onPress={() => navigation.navigate("FoodDetail", { id: food.id })}
                  onAddToCart={handleAddToCart}
                />
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
  searchInputPlaceholder: { flex: 1, color: "#A0A5BA", fontSize: 14 },

  // Promo Banner
  promoSection: { marginTop: 15 },
  promoBannerContainer: {
    width: width,
    alignItems: 'center',
  },
  promoBanner: {
    width: width - 30, // Chiều rộng bằng khung hình trừ lề
    height: 120,
    backgroundColor: "#FF7622",
    borderRadius: 12,
    justifyContent: "center",
    padding: 20,
  },
  promoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
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
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 6,
    paddingRight: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryPillIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryPillText: {
    fontWeight: "700",
    color: "#32343E",
    fontSize: 13,
  },

  // Food Grid
  foodGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});

export default HomeScreen;