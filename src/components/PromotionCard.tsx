import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

import { Promotion } from "../types/promotion";
import { formatCurrency } from "../utils/formatters";

interface Props {
  promo: Promotion;
  status: "active" | "upcoming" | "expired";
  onPress?: () => void;
}

export default function PromotionCard({ promo, status, onPress }: Props) {
  const renderDiscount = () => {
    if (promo.discount_type === "percent") {
      return `${promo.discount_value}%`;
    }
    return formatCurrency(promo.discount_value, "VND");
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{promo.name}</Text>
        <Text style={styles.discount}>{renderDiscount()}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{status.toUpperCase()}</Text>
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

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },

  discount: {
    fontSize: 15,
    color: "#777",
    fontWeight: "600",
  },

  badge: {
    backgroundColor: "#FFF1E7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  badgeText: {
    color: "#FF7622",
    fontWeight: "700",
    fontSize: 12,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
});
