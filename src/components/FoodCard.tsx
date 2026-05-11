import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "../utils/formatters";

interface Props {
  type: "fastfood" | "dessert" | "drink";
  name: string;
  id: string;
  price: number;
  image_url?: string;
  onPress?: () => void;
}

export default function FoodCard({
  type,
  name,
  price,
  image_url,
  onPress,
}: Props) {
  const getTypeLabel = () => {
    switch (type) {
      case "fastfood":
        return "Fastfood";

      case "dessert":
        return "Dessert";

      case "drink":
        return "Drink";

      default:
        return "Food";
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      {/* image */}
      <Image
        source={{
          uri: image_url || "https://picsum.photos/200",
        }}
        style={styles.image}
      />

      {/* content */}
      <View style={styles.content}>
        {/* top row */}
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={styles.name}>
            {name}
          </Text>

          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={22} color="#222" />
          </TouchableOpacity>
        </View>

        {/* giá và loại */}
        <View style={styles.bottomRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getTypeLabel()}</Text>
          </View>

          <Text style={styles.price}>{formatCurrency(price, "USD")}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "#A8B5C7",
    marginRight: 16,
  },

  content: {
    flex: 1,
    height: 96,
    justifyContent: "space-between",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  name: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginRight: 12,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    backgroundColor: "#FFE8D9",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },

  badgeText: {
    color: "#FF7622",
    fontSize: 14,
    fontWeight: "600",
  },

  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
});
