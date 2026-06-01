import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import RBSheet from "react-native-raw-bottom-sheet";

// Components
import BackButton from "../../components/BackButton";
import CustomButton from "../../components/CustomButton";
import SectionCard from "../../components/checkout/SectionCard";
import PaymentOption from "../../components/checkout/PaymentOption";

// Services & Store
import { AddressService, UserAddress } from "../../services/address.service";
import { getValidPromotions, applyPromotion } from "../../services/promotion.service";
import { CheckoutService } from "../../services/checkout.service";
import { useCartStore } from "../../store/useCartStore";

// --- Types ---
type PaymentMethod = "cash" | "vnpay";

interface Promotion {
  id: number;
  name: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  start_date: string;
  end_date: string;
}

export default function CheckoutScreen({ navigation, route }: any) {
  const { checkedItemIds } = route.params as { checkedItemIds: number[] };
  const { items, fetchCart } = useCartStore();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [orderNote, setOrderNote] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);

  // RBSheet Refs
  const addressSheetRef = useRef<any>(null);
  const promoSheetRef = useRef<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [addrRes, promoRes] = await Promise.all([
        AddressService.getAddresses(),
        getValidPromotions().catch(() => []),
      ]);

      if (addrRes.success && addrRes.data) {
        setAddresses(addrRes.data);
        const def = addrRes.data.find((a) => a.is_default) ?? addrRes.data[0] ?? null;
        setSelectedAddress(def);
      }
      if (promoRes) setPromotions(promoRes as Promotion[]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const checkedItems = items.filter((item) => checkedItemIds.includes(item.id));
  const subtotal = checkedItems.reduce(
    (sum, item) => sum + item.quantity * (item.foods?.price ?? 0),
    0
  );
  const discount = selectedPromo
    ? subtotal - applyPromotion(subtotal, selectedPromo)
    : 0;
  const total = subtotal - discount;

  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn địa chỉ giao hàng.");
      return;
    }
    setIsOrdering(true);
    const res = await CheckoutService.processOrder(
      selectedAddress.address,
      paymentMethod,
      checkedItemIds,
      selectedPromo?.id
    );
    setIsOrdering(false);

    if (!res.success) {
      Alert.alert("Đặt hàng thất bại", res.error || "Có lỗi xảy ra.");
      return;
    }

    await fetchCart();

    if (paymentMethod === "vnpay" && res.data?.paymentUrl) {
      await WebBrowser.openAuthSessionAsync(res.data.paymentUrl);
    }
    navigation.replace("OrderSuccess", { orderId: res.data?.orderId ?? 0 });
  };

  const renderAddressItem = ({ item }: { item: UserAddress }) => {
    const isSelected = selectedAddress?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.listItemSelected]}
        onPress={() => {
          setSelectedAddress(item);
          addressSheetRef.current?.close();
        }}
      >
        <View style={styles.listIconBox}>
          <Ionicons
            name={
              item.label === "Nhà"
                ? "home-outline"
                : item.label === "Cơ quan"
                  ? "business-outline"
                  : "location-outline"
            }
            size={20}
            color={isSelected ? "#FF7622" : "#6E7078"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.listLabel, isSelected && styles.listLabelSelected]}>
            {item.label}
            {item.is_default && <Text style={styles.defaultTag}> • Mặc định</Text>}
          </Text>
          <Text style={styles.listDesc} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={22} color="#FF7622" />}
      </TouchableOpacity>
    );
  };

  const renderPromoItem = ({ item }: { item: Promotion }) => {
    const isSelected = selectedPromo?.id === item.id;
    const discountLabel =
      item.discount_type === "percent"
        ? `Giảm ${item.discount_value}%`
        : `Giảm ${item.discount_value.toLocaleString()}đ`;
    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.listItemSelected]}
        onPress={() => {
          setSelectedPromo(item);
          promoSheetRef.current?.close();
        }}
      >
        <View style={styles.listIconBox}>
          <Ionicons name="pricetag" size={20} color={isSelected ? "#FF7622" : "#6E7078"} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.listLabel, isSelected && styles.listLabelSelected]}>
            {item.name}
          </Text>
          <Text style={styles.listDesc}>{discountLabel}</Text>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={22} color="#FF7622" />}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centerFlex}>
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Địa chỉ */}
        <SectionCard
          title="Địa chỉ giao hàng"
          rightElement={
            <TouchableOpacity onPress={() => addressSheetRef.current?.open()}>
              <Text style={styles.changeBtn}>Thay đổi</Text>
            </TouchableOpacity>
          }
        >
          {selectedAddress ? (
            <View style={styles.addrDisplay}>
              <View style={styles.addrDisplayIcon}>
                <Ionicons name="location" size={18} color="#FF7622" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addrDisplayLabel}>{selectedAddress.label}</Text>
                <Text style={styles.addrDisplayText}>{selectedAddress.address}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.noAddrBtn} onPress={() => addressSheetRef.current?.open()}>
              <Ionicons name="add-circle-outline" size={20} color="#FF7622" />
              <Text style={styles.noAddrText}>Chọn địa chỉ giao hàng</Text>
            </TouchableOpacity>
          )}
        </SectionCard>

        {/* Đơn hàng */}
        <SectionCard title="ĐƠN HÀNG CỦA BẠN">
          {/* Header của hoá đơn */}
          <View style={styles.invoiceHeader}>
            <Text style={[styles.invoiceHeaderText, { flex: 2 }]}>Tên món</Text>
            <Text style={[styles.invoiceHeaderText, { flex: 0.8, textAlign: 'center' }]}>Số lượng</Text>
            <Text style={[styles.invoiceHeaderText, { flex: 1.2, textAlign: 'right' }]}>Thành tiền</Text>
          </View>

          {checkedItems.map((item) => (
            <View key={item.id} style={styles.orderRow}>
              <Text style={styles.orderItemName} numberOfLines={2}>
                {item.foods?.name ?? "Món ăn"}
              </Text>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <Text style={styles.orderItemPrice}>
                {(item.quantity * (item.foods?.price ?? 0)).toLocaleString()}đ
              </Text>
            </View>
          ))}
          <View style={styles.noteContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="Ghi chú cho nhà hàng (tùy chọn)..."
              placeholderTextColor="#A0A5BA"
              value={orderNote}
              onChangeText={setOrderNote}
              multiline
            />
          </View>
        </SectionCard>

        {/* Mã giảm giá */}
        <SectionCard
          title="Mã giảm giá"
          rightElement={
            <TouchableOpacity style={styles.promoSelectBtn} onPress={() => promoSheetRef.current?.open()}>
              <Ionicons name="pricetag-outline" size={14} color="#FF7622" />
              <Text style={styles.promoSelectText}>{selectedPromo ? selectedPromo.name : "Chọn mã"}</Text>
              <Ionicons name="chevron-forward" size={14} color="#FF7622" />
            </TouchableOpacity>
          }
        >
          {selectedPromo && (
            <View style={styles.promoAppliedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#2ECC71" />
              <Text style={styles.promoAppliedText}>
                {selectedPromo.discount_type === "percent"
                  ? `Giảm ${selectedPromo.discount_value}% cho đơn hàng`
                  : `Giảm ${selectedPromo.discount_value.toLocaleString()}đ cho đơn hàng`}
              </Text>
            </View>
          )}
        </SectionCard>

        {/* Phương thức thanh toán */}
        <SectionCard title="Phương thức thanh toán">
          <View style={{ gap: 10 }}>
            <PaymentOption
              label="Tiền mặt (COD)"
              description="Thanh toán khi nhận hàng"
              iconName="cash-outline"
              isSelected={paymentMethod === "cash"}
              onPress={() => setPaymentMethod("cash")}
            />
            <PaymentOption
              label="VNPay"
              description="Thanh toán online qua VNPay"
              iconName="card-outline"
              isSelected={paymentMethod === "vnpay"}
              onPress={() => setPaymentMethod("vnpay")}
            />
          </View>
        </SectionCard>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tạm tính</Text>
          <Text style={styles.priceValue}>{subtotal.toLocaleString()}đ</Text>
        </View>
        {discount > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giảm giá</Text>
            <Text style={styles.discountValue}>-{discount.toLocaleString()}đ</Text>
          </View>
        )}
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalValue}>{total.toLocaleString()}đ</Text>
        </View>
        <CustomButton
          title="XÁC NHẬN ĐẶT HÀNG"
          onPress={handleConfirmOrder}
          isLoading={isOrdering}
          disabled={!selectedAddress || isOrdering}
          buttonStyle={{ height: 54, borderRadius: 16, marginTop: 16 }}
        />
      </View>

      {/* Address Bottom Sheet */}
      <RBSheet
        ref={addressSheetRef}
        height={400}
        customStyles={{ container: styles.sheetContainer, draggableIcon: styles.draggableIcon }}
      >
        <Text style={styles.sheetTitle}>Chọn địa chỉ giao hàng</Text>
        {addresses.length === 0 ? (
          <View style={styles.sheetEmpty}>
            <Ionicons name="location-outline" size={48} color="#E0E4F0" />
            <Text style={styles.sheetEmptyText}>Chưa có địa chỉ nào</Text>
          </View>
        ) : (
          <FlatList
            data={addresses}
            keyExtractor={(a) => a.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={renderAddressItem}
          />
        )}
      </RBSheet>

      {/* Promo Bottom Sheet */}
      <RBSheet
        ref={promoSheetRef}
        height={400}
        customStyles={{ container: styles.sheetContainer, draggableIcon: styles.draggableIcon }}
      >
        <Text style={styles.sheetTitle}>Chọn mã giảm giá</Text>
        {promotions.length === 0 ? (
          <View style={styles.sheetEmpty}>
            <Ionicons name="pricetag-outline" size={48} color="#E0E4F0" />
            <Text style={styles.sheetEmptyText}>Hiện không có mã nào khả dụng</Text>
          </View>
        ) : (
          <FlatList
            data={promotions}
            keyExtractor={(p) => p.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            ListHeaderComponent={
              selectedPromo ? (
                <TouchableOpacity
                  style={styles.removePromoBtn}
                  onPress={() => {
                    setSelectedPromo(null);
                    promoSheetRef.current?.close();
                  }}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#FF7622" />
                  <Text style={styles.removePromoText}>Bỏ áp dụng mã</Text>
                </TouchableOpacity>
              ) : null
            }
            renderItem={renderPromoItem}
          />
        )}
      </RBSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFF",
    borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#181C2E" },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 24 },
  centerFlex: { flex: 1, justifyContent: "center", alignItems: "center" },

  changeBtn: { fontSize: 13, color: "#FF7622", fontWeight: "600" },
  addrDisplay: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 4 },
  addrDisplayIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFF2E8",
    justifyContent: "center", alignItems: "center",
  },
  addrDisplayLabel: { fontSize: 13, fontWeight: "700", color: "#32343E", marginBottom: 2 },
  addrDisplayText: { fontSize: 13, color: "#6E7078", lineHeight: 18 },
  noAddrBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1.5, borderColor: "#FF7622", borderStyle: "dashed",
    borderRadius: 10, padding: 12, justifyContent: "center", marginTop: 4,
  },
  noAddrText: { color: "#FF7622", fontSize: 14, fontWeight: "600" },

  // Invoice Style
  invoiceHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 8,
    marginBottom: 8,
  },
  invoiceHeaderText: {
    fontSize: 12,
    color: "#A0A5BA",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  orderItemName: {
    flex: 2,
    fontSize: 14,
    color: "#32343E",
    fontWeight: "500",
    paddingRight: 8,
  },
  qtyText: {
    flex: 0.8,
    fontSize: 14,
    fontWeight: "600",
    color: "#6E7078",
    textAlign: "center",
  },
  orderItemPrice: {
    flex: 1.2,
    fontSize: 14,
    fontWeight: "700",
    color: "#181C2E",
    textAlign: "right",
  },
  noteContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  noteInput: {
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#32343E",
    minHeight: 60,
    textAlignVertical: "top",
  },

  promoSelectBtn: {
    flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFF2E8",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  promoSelectText: { fontSize: 13, color: "#FF7622", fontWeight: "600" },
  promoAppliedBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F0FBF4",
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginTop: 4,
  },
  promoAppliedText: { fontSize: 13, color: "#27AE60", fontWeight: "500" },

  footer: {
    backgroundColor: "#FFF", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 10,
  },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  priceLabel: { fontSize: 14, color: "#6E7078" },
  priceValue: { fontSize: 14, color: "#32343E", fontWeight: "500" },
  discountValue: { fontSize: 14, color: "#2ECC71", fontWeight: "600" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#F0F0F0", paddingTop: 10, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#181C2E" },
  totalValue: { fontSize: 20, fontWeight: "800", color: "#FF7622" },

  sheetContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 20 },
  draggableIcon: { backgroundColor: "#E0E4F0", width: 40, height: 4 },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#181C2E", marginBottom: 16, paddingHorizontal: 20, paddingTop: 10 },
  sheetEmpty: { alignItems: "center", paddingVertical: 32, gap: 12 },
  sheetEmptyText: { fontSize: 14, color: "#A0A5BA" },

  listItem: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: 12, marginBottom: 8, borderWidth: 1.5, borderColor: "#F0F0F0",
  },
  listItemSelected: { borderColor: "#FF7622", backgroundColor: "#FFF8F3" },
  listIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F5F7FA", justifyContent: "center", alignItems: "center" },
  listLabel: { fontSize: 13, fontWeight: "700", color: "#32343E" },
  listLabelSelected: { color: "#FF7622" },
  listDesc: { fontSize: 12, color: "#6E7078", marginTop: 2 },
  defaultTag: { fontSize: 11, color: "#FF7622", fontWeight: "400" },

  removePromoBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12, alignSelf: "flex-start" },
  removePromoText: { fontSize: 13, color: "#FF7622", fontWeight: "600" },
});
