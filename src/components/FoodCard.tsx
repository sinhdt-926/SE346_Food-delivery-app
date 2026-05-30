import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { formatCurrency } from "../utils/formatters";

interface Props {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category_name?: string;
  onPress?: () => void;
}
export default function FoodCard({
  name,
  price,
  image_url,
  is_available,
  category_name,
  onPress,
}: Props) {
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
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: is_available ? "#22C55E" : "#9CA3AF",
              },
            ]}
          />
        </View>
        {/* bottom */}
        <View style={styles.bottomRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{category_name ?? "Unknown"}</Text>
          </View>
          <Text style={styles.price}>{formatCurrency(price, "VND")}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    textTransform: "capitalize",
  },

  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    marginTop: 6,
  },
});
