import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface HomeFoodCardProps {
  food: any;
  finalPrice: number;
  promo: any;
  addingId: number | null;
  onPress: () => void;
  onAddToCart: (food: any) => void;
}

const HomeFoodCard: React.FC<HomeFoodCardProps> = ({
  food,
  finalPrice,
  promo,
  addingId,
  onPress,
  onAddToCart,
}) => {
  return (
    <TouchableOpacity
      style={styles.foodCard}
      activeOpacity={0.9}
      onPress={onPress}
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
              {promo.discount_type === "percent"
                ? `-${promo.discount_value}%`
                : `-${promo.discount_value / 1000}k`}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.foodInfo}>
        <Text style={styles.foodName} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={styles.foodCategory}>
          {food.categories?.category_name}
        </Text>

        <View style={styles.priceRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.foodPrice}>{finalPrice.toLocaleString()}đ</Text>
            {promo && (
              <Text style={styles.foodOriginalPrice}>
                {food.price.toLocaleString()}đ
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.addBtn,
              !food.is_available && { backgroundColor: "#BDBDBD" },
            ]}
            onPress={() => onAddToCart(food)}
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
};

const styles = StyleSheet.create({
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
  unavailableText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 1,
  },
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
  foodName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#32343E",
    marginBottom: 2,
  },
  foodCategory: { color: "#A0A5BA", fontSize: 11, marginBottom: 6 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodPrice: { fontSize: 14, fontWeight: "bold", color: "#FF7622" },
  foodOriginalPrice: {
    fontSize: 11,
    color: "#A0A5BA",
    textDecorationLine: "line-through",
  },
  addBtn: {
    backgroundColor: "#FF7622",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeFoodCard;
