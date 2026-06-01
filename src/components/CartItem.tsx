import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Checkbox } from "expo-checkbox";
import { CartItem } from "../types/cart";

export interface CartItemUI extends CartItem {
  checked?: boolean; // Trạng thái checkbox
}
interface CartItemCardProps {
  item: CartItemUI;
  openedId: number | null;
  setOpenedId: (id: number | null) => void;
  updateQty: (id: number, quantity: number) => void;
  deleteItem: (id: number) => void;
  toggleCheck: (id: number) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  openedId,
  setOpenedId,
  updateQty,
  deleteItem,
  toggleCheck,
}) => {
  const swipeableRef = useRef<any>(null);

  const food = item.foods;

  const isAvailable = food.is_available;

  useEffect(() => {
    if (openedId !== null && openedId !== item.id) {
      swipeableRef.current?.close();
    }
  }, [openedId, item.id]);

  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deleteItem(item.id)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={28} color="white" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.cardWrapper}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => setOpenedId(item.id)}
        friction={2}
        rightThreshold={40}
      >
        <View style={styles.card}>
          <Checkbox
            style={styles.checkbox}
            value={item.checked}
            onValueChange={() => toggleCheck(item.id)}
            color={item.checked ? "#FF7622" : undefined}
          />
          {/* Hình ảnh món ăn */}
          {food.image_url ? (
            <Image
              source={{ uri: food.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            // Nếu không có ảnh, hiển thị placeholder
            <View style={styles.imagePlaceholder}>
              <Ionicons name="restaurant-outline" size={24} color="#A0A5BA" />
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.itemName} numberOfLines={2}>
              {food.name}
            </Text>
            {/* Hiển thị giá tiền */}
            <Text style={styles.priceText}>{(food.price)} đ</Text>

            {/* Hiển thị trạng thái hết hàng nếu có */}
            {!food.is_available && (
              <Text style={styles.unavailableText}>Tạm hết hàng</Text>
            )}
          </View>

          <View style={styles.qtyContainer}>
            <TouchableOpacity
              // Trừ đi 1 đơn vị
              onPress={() => updateQty(item.id, item.quantity - 1)}
              style={styles.qtyBtn}
            >
              <Ionicons
                name="remove-circle-outline"
                size={22}
                color="#B9BBBF"
              />
            </TouchableOpacity>

            {/* Số lượng */}
            <Text style={styles.qtyText}>{item.quantity}</Text>

            <TouchableOpacity
              // Cộng thêm 1 đơn vị
              onPress={() => updateQty(item.id, item.quantity + 1)}
              style={styles.qtyBtn}
              disabled={!food.is_available} // Không cho tăng nếu hết hàng
            >
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={food.is_available ? "#181C2E" : "#B9BBBF"}
              />
            </TouchableOpacity>
          </View>
          {!isAvailable && <View style={styles.disabledOverlay} />}
        </View>
      </Swipeable>
    </View>
  );
};

export default CartItemCard;

const styles = StyleSheet.create({
  checkbox: {
    borderRadius: 5,
    marginRight: 12,
    width: 20,
    height: 20,
  },
  cardWrapper: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#FF4722",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  disabledOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 15,
    zIndex: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 15,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 15,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: "#F0F5FA",
    borderRadius: 12,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: "600", color: "#32343E" },
  priceText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2b2424ff",
    marginTop: 5,
  },
  unavailableText: {
    fontSize: 12,
    color: "#FF4722",
    marginTop: 4,
    fontStyle: "italic",
    zIndex: 11,
  },
  qtyContainer: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { padding: 3 },
  qtyText: { fontSize: 13, fontWeight: "bold", marginHorizontal: 8 },
  deleteBtn: {
    backgroundColor: "#FF4722",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
});
