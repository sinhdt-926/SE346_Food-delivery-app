import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Food } from "../types/food";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  item: Food;
  onPress?: () => void;
};

export default function FoodCardDetail({ item, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Image */}
      <Image source={{ uri: item.image_url ?? "" }} style={styles.image} />

      {/* Content */}
      <View style={styles.content}>
        {/* Top row */}
        <View style={styles.rowBetween}>
          <Text style={styles.name}>{item.name}</Text>
          <Ionicons name="ellipsis-horizontal" size={18} color="#888" />
        </View>

        {/* Category tag */}
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.category ?? "Food"}</Text>
        </View>

        {/* Bottom row */}
        <View style={styles.rowBetween}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FF8C00" />
            <Text style={styles.rating}>{item.rating ?? 4.9}</Text>
          </View>

          <Text style={styles.price}>${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#ccc",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
  },

  tag: {
    backgroundColor: "#FFE6D9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 6,
  },

  tagText: {
    color: "#FF6B35",
    fontSize: 12,
    fontWeight: "500",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  rating: {
    marginLeft: 4,
    fontWeight: "600",
    fontSize: 13,
  },

  review: {
    marginLeft: 6,
    color: "#888",
    fontSize: 12,
  },

  price: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
