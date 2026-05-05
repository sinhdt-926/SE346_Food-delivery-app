import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { CartItem } from "../types/cartitem";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  item: CartItem;
  onDelete: (id: number) => void;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
};

export default function CartItemComponent({
  item,
  onDelete,
  onIncrease,
  onDecrease,
}: Props) {
  const renderRightActions = () => {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={style.containerDelete}
        >
          <Ionicons name="trash-outline" size={26} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={style.container}>
        {/* Image */}
        <Image
          source={{ uri: item.food.image_url ?? "" }}
          style={style.image}
        />

        {/* Content */}
        <View style={{ marginLeft: 12, flex: 1 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {item.food.name}
              </Text>

              <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 6 }}>
                {item.food.price}
              </Text>
            </View>

            {/* Quantity */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => onDecrease(item.id)}
                style={style.btnChange} //nut remove
              >
                <Ionicons name="remove" size={16} />
              </TouchableOpacity>

              <Text style={{ marginHorizontal: 10, fontWeight: "600" }}>
                {item.quantity}
              </Text>

              <TouchableOpacity
                onPress={() => onIncrease(item.id)}
                style={style.btnChange} //nut add
              >
                <Ionicons name="add" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}
const style = StyleSheet.create({
  btnChange: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#ccc",
  },
  containerDelete: {
    backgroundColor: "#FF3F14",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});
