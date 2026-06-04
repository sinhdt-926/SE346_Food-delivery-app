import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartItemCard from "../../components/CartItem";
import BackButton from "../../components/BackButton";
import CustomButton from "../../components/CustomButton";

// Import Store
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";
// Import Service để gọi API
import { Alert } from "react-native";

const CartScreen = ({ navigation }: any) => {
  const [openedId, setOpenedId] = useState<number | null>(null);
  const { user } = useAuthStore();

  // Lấy dữ liệu và hàm từ Zustand Store
  const {
    items,
    isLoading,
    checkedIds,
    fetchCart,
    updateQuantity,
    removeFromCart,
    toggleCheck,
    getTotalPrice,
    resetCartState,
  } = useCartStore();

  // Tự động load giỏ hàng khi vào màn hình
  useEffect(() => {
    fetchCart();
  }, []);

  const total = getTotalPrice();

  const handleGoToCheckout = () => {
    if (checkedIds.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng.');
      return;
    }
    navigation.navigate('Checkout', { checkedItemIds: checkedIds });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation?.goBack()} />
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
      </View>

      {/* Hiển thị Loading khi đang gọi API */}
      {isLoading && items.length === 0 ? (
        <ActivityIndicator
          size="large"
          color="#FF7622"
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onTouchStart={() => setOpenedId(null)}
        >
          {items.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có sản phẩm trong giỏ hàng.</Text>
          ) : null}
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              // Ép kiểu (hoặc thêm property checked vào lúc map) để truyền vào Component con
              item={{ ...item, checked: checkedIds.includes(item.id) } as any}
              openedId={openedId}
              setOpenedId={setOpenedId}
              updateQty={updateQuantity}
              deleteItem={removeFromCart}
              toggleCheck={toggleCheck}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <View style={styles.bottomRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={styles.totalValue} numberOfLines={1} adjustsFontSizeToFit>
              {total.toLocaleString()}đ
            </Text>
          </View>
          <CustomButton
            title="ĐẶT HÀNG"
            onPress={handleGoToCheckout}
            buttonStyle={{ width: 140, paddingVertical: 15, borderRadius: 15 }}
            disabled={total === 0 || isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#181C2E",
    marginLeft: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#A0A5BA",
    marginTop: "50%",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#A0A5BA",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000ff",
  },
});
