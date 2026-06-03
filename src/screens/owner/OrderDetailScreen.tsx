import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import BackButton from "../../components/BackButton";
import CustomButton from "../../components/CustomButton";
import { useRoute, useNavigation } from "@react-navigation/native";
import { updateOrderStatus } from "../../services/order.service";
import { Order, OrderStatus } from "../../types/order";
import { formatCurrency, formatRelativeTime } from "../../utils/formatters";

export default function OrderDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { order } = route.params;
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: "none",
      },
    });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          height: 80,
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 10,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: "absolute",
        },
      });
    };
  }, []);

  const getActionTitle = () => {
    switch (currentOrder.status) {
      case "pending":
        return "Xác nhận";

      case "preparing":
        return "Giao hàng";

      case "delivering":
        return "Hoàn thành";

      default:
        return null;
    }
  };

  //thay đổi trạng thái đơn hàng
  const handleNextState = async () => {
    let nextStatus: OrderStatus = currentOrder.status;
    switch (currentOrder.status) {
      case "pending":
        nextStatus = "preparing";
        break;

      case "preparing":
        nextStatus = "delivering";
        break;

      case "delivering":
        nextStatus = "completed";
        break;
    }

    try {
      setActionLoading(true);
      await updateOrderStatus(currentOrder.id, nextStatus);
      setCurrentOrder((prev) => ({
        ...prev,
        status: nextStatus,
      }));
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng", [
        {
          text: "Thử lại",
          onPress: () => handleNextState(),
        },
        {
          text: "Đóng",
          style: "cancel",
        },
      ]);
    } finally {
      setActionLoading(false);
    }
  };

  //hủy đơn hàng
  const handleCancelOrder = async () => {
    try {
      setActionLoading(true);
      await updateOrderStatus(currentOrder.id, "cancelled");
      setCurrentOrder((prev) => ({
        ...prev,
        status: "cancelled",
      }));
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng", [
        {
          text: "Thử lại",
          onPress: () => handleCancelOrder(),
        },
        {
          text: "Đóng",
          style: "cancel",
        },
      ]);
    } finally {
      setActionLoading(false);
    }
  };
  const getStatusLabel = () => {
    switch (currentOrder.status) {
      case "pending":
        return "Chờ xác nhận";

      case "preparing":
        return "Đang chuẩn bị";

      case "delivering":
        return "Đang giao";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return null;
    }
  };
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      {/* header */}
      <View style={styles.header}>
        <BackButton />

        <Text style={styles.title}>Chi Tiết Đơn Hàng</Text>
      </View>

      {/* status */}
      <View style={styles.statusCard}>
        <View>
          <Text style={styles.orderId}>Đơn hàng #{currentOrder.id}</Text>

          <Text style={styles.label}>
            {formatRelativeTime(currentOrder.created_at, true)}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{getStatusLabel()}</Text>
        </View>
      </View>

      {/* customer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
        <InfoRow label="Tên" value={currentOrder.customer.fullname} />
        <InfoRow
          label="Số điện thoại"
          value={currentOrder.customer.phone_number}
        />
      </View>

      {/* address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
        <Text style={styles.address}>{currentOrder.address}</Text>
      </View>

      {/* note */}
      {currentOrder.note ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Note</Text>
          <Text style={styles.note}>{currentOrder.note}</Text>
        </View>
      ) : null}

      {/* items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Món ăn</Text>

        {currentOrder.items.map((item, index) => (
          <FoodItem
            key={index}
            name={item.name}
            quantity={item.quantity}
            price={item.subtotal}
          />
        ))}

        {/*loading*/}
        {actionLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF7622" />
            <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
          </View>
        )}
      </View>

      {/* payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thánh toán</Text>
        <InfoRow label="Phương thức" value={currentOrder.payment.type} />
        <InfoRow label="Trạng thái" value={currentOrder.payment.status} />
        <View style={styles.divider} />
        <InfoRow
          label="Thành tiền"
          value={formatCurrency(currentOrder.payment.amount, "VND")}
          bold
        />
      </View>
      {currentOrder.status !== "completed" &&
        currentOrder.status !== "cancelled" && (
          <View style={styles.buttonRow}>
            <CustomButton
              title={getActionTitle()!}
              onPress={handleNextState}
              disabled={actionLoading}
              buttonStyle={styles.doneButton}
            />

            <CustomButton
              title="Hủy"
              buttonStyle={styles.cancelButton}
              onPress={handleCancelOrder}
              disabled={actionLoading}
              textStyle={styles.cancelText}
            />
          </View>
        )}
    </ScrollView>
  );
}

interface InfoRowProps {
  label: string;
  value: string | number;
  bold?: boolean;
}
function InfoRow({ label, value, bold }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>

      <Text style={[styles.value, bold && styles.boldValue]}>{value}</Text>
    </View>
  );
}
interface FoodItem {
  name: string;
  quantity: number;
  price: number;
}
function FoodItem({ name, quantity, price }: FoodItem) {
  return (
    <View style={styles.foodItemContainer}>
      <View style={styles.foodItemTop}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{name}</Text>

          <Text style={styles.foodQty}>Số lượng: {quantity}</Text>
        </View>

        <Text style={styles.foodPrice}>{formatCurrency(price, "VND")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: 65,
    paddingHorizontal: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginLeft: 18,
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  badge: {
    backgroundColor: "#FFF1E8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },

  badgeText: {
    color: "#FF7A1A",
    fontWeight: "700",
    fontSize: 12,
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  label: {
    color: "#8E8E8E",
    fontSize: 12,
  },

  value: {
    color: "#222222",
    fontSize: 15,
    fontWeight: "500",
  },

  boldValue: {
    fontSize: 18,
    fontWeight: "700",
  },

  address: {
    color: "#555555",
    lineHeight: 24,
    fontSize: 15,
  },

  divider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginVertical: 16,
  },

  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 4,
  },

  foodQty: {
    color: "#8E8E8E",
    marginBottom: 4,
  },

  note: {
    color: "#B1B1B1",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },

  foodPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF7A1A",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 120,
  },

  doneButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 18,
    paddingVertical: 14,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#EF4444",
    borderRadius: 18,
    paddingVertical: 14,
  },

  cancelText: {
    color: "#EF4444",
  },

  foodItemContainer: {
    marginBottom: 20,
  },

  foodItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  foodInfo: {
    flex: 1,
    paddingRight: 12,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#111",
    textAlign: "center",
  },
});
