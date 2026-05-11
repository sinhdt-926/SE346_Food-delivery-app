import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { formatCurrency } from "../utils/formatters";

interface Props {
  type: "fastfood" | "dessert" | "drink";
  name: string;
  id: string;
  price: number;
  imageUrl?: string;
  onPress?: () => void;
}

export default function FoodCard({
  type,
  name,
  price,
  id,
  imageUrl,
  onPress,
}: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.topSection}>
        <Image
          source={{
            uri: imageUrl || "https://i.pravatar.cc/150",
          }}
          style={styles.image}
        />
        {/* Thông tin món ăn */}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.price}>
            Total: {formatCurrency(price, "USD")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 18,
    marginBottom: 20,
  },

  topSection: {
    flexDirection: "row",
  },

  info: {
    flex: 1,
    justifyContent: "space-between",
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: "#A8B5C7",
    marginRight: 18,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  id: {
    fontSize: 15,
    color: "#9E9E9E",
  },

  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },
});
