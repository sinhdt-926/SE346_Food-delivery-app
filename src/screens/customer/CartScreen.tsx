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
// Import Service để gọi API
import { CheckoutService } from "../../services/checkout.service";
import { Alert } from "react-native";

const CartScreen = ({ navigation }: any) => {
  const [openedId, setOpenedId] = useState<number | null>(null);

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

  const handleCheckout = async () => {
    // Tạm lấy dữ liệu cứng đang có trên UI để test API
    const address = "120, Yên Lãng, Cao Bằng";
    const paymentType = "cod"; // Mặc định COD

    // Gọi CheckoutService theo tham số yêu cầu
    const response = await CheckoutService.processOrder(address, paymentType, checkedIds);

    if (response.success) {
      /* Thay vì dùng resetCartState làm mất luôn các món chưa thanh toán,
         ta gọi fetchCart để đồng bộ lại data từ Supabase */
      await fetchCart();
      
      Alert.alert(
        "Thành công",
        `Đặt hàng thành công! Mã đơn: ${response.data}`,
      );
      // Sau này cần thêm navigation.navigate("SuccessScreen") tại đây
    } else {
      Alert.alert("Lỗi", response.error || "Có lỗi xảy ra khi thanh toán");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation?.goBack()} />
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity>
          <Text style={styles.editBtnText}>EDIT ITEMS</Text>
        </TouchableOpacity>
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
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              // Ép kiểu (hoặc thêm property checked vào lúc map) để truyền vào Component con
              item={{ ...item, checked: checkedIds.includes(item.id) } as any}
              openedId={openedId}
              setOpenedId={setOpenedId}
              updateQty={updateQuantity} // Gọi thẳng hàm của Store
              deleteItem={removeFromCart}
              toggleCheck={toggleCheck}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <View style={styles.addressSection}>
          <Text style={styles.label}>DELIVERY ADDRESS</Text>
          <TouchableOpacity>
            <Text style={styles.editLink}>EDIT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>120, Yên Lãng, Cao Bằng</Text>
        </View>
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.totalLabel}>
              TOTAL: <Text style={styles.totalValue}>${total}</Text>
            </Text>
          </View>
          <CustomButton
            title="PLACE ORDER"
            onPress={handleCheckout}
            buttonStyle={{ width: 160, paddingVertical: 15, borderRadius: 15 }}
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#181C2E",
  },
  editBtnText: {
    color: "#FF7622",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  footer: {
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
  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: "#A0A5BA",
    fontWeight: "bold",
  },
  editLink: {
    color: "#FF7622",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  addressBox: {
    backgroundColor: "#F0F5FA",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  addressText: {
    color: "#32343E",
    fontSize: 14,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#181C2E",
  },
});
