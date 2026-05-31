import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

import { Promotion } from "../types/promotion";
import { formatCurrency } from "../utils/formatters";

interface Props {
  promo: Promotion;
  status: "all" | "active" | "upcoming" | "expired";
  onPress?: () => void;
}

export default function PromotionCard({ promo, status, onPress }: Props) {
  const renderDiscount = () => {
    if (promo.discount_type === "percent") {
      return `${promo.discount_value}%`;
    }
    return formatCurrency(promo.discount_value, "VND");
  };
  const getBadgeStyle = () => {
    switch (status) {
      case "active":
        return styles.activeBadge;

      case "upcoming":
        return styles.upcomingBadge;

      case "expired":
        return styles.expiredBadge;
    }
  };

  const getBadgeTextStyle = () => {
    switch (status) {
      case "active":
        return styles.activeText;

      case "upcoming":
        return styles.upcomingText;

      case "expired":
        return styles.expiredText;
    }
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
      <View style={[styles.badge, getBadgeStyle()]}>
        <Text style={[styles.badgeText, getBadgeTextStyle()]}>
          {status.toUpperCase()}
        </Text>
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
  activeBadge: {
    backgroundColor: "#E9FFF0",
  },
  upcomingBadge: {
    backgroundColor: "#FFF1E7",
  },
  expiredBadge: {
    backgroundColor: "#F3F4F6",
  },
  activeText: {
    color: "#22C55E",
  },
  upcomingText: {
    color: "#FF7622",
  },
  expiredText: {
    color: "#9CA3AF",
  },
});
