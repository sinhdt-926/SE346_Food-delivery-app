import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { CardFood } from "../types/cardfood";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  item: CardFood;
};

export default function CardFoodSmallComponent({ item }: Props) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: item.food.image_url ?? "" }} style={styles.image} />

      <Text style={styles.name}>{item.food.name}</Text>

      <View style={styles.rowBottom}>
        <Text style={styles.price}>{item.food.price}</Text>

        <TouchableOpacity style={styles.btnChoose}>
          <Ionicons name="add" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    backgroundColor: "#ccc",
  },

  name: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },

  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  price: {
    fontWeight: "bold",
  },

  btnChoose: {
    width: 30,
    height: 30,
    borderRadius: 14,
    backgroundColor: "#FF3F14",
    justifyContent: "center",
    alignItems: "center",
  },
});
