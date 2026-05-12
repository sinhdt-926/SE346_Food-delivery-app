import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import TopTabButton from "../../components/TopTabButton";
import OrderCard from "../../components/OrderCard";
import { useNavigation } from "@react-navigation/native";
import {
  getOwnerOrders,
  updateOrderStatus,
} from "../../services/order.service";
import { Order, OrderStatus } from "../../types/order";
import CustomButton from "../../components/CustomButton";

export default function ManagerOrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("pending");
  const [orders, setOrders] = useState<Order[]>([]);
  const filteredOrders = orders.filter((item) => item.status === activeTab);
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  //load data
  const fetchOrders = async (isFlag = true) => {
    try {
      setLoading(true);
      setError("");
      if (!isFlag) return;
      const data: Order[] = await getOwnerOrders();
      setOrders(data);
    } catch (error) {
      if (isFlag) setError("Không thể tải danh sách đơn hàng");
    } finally {
      if (isFlag) setLoading(false);
    }
  };
  useEffect(() => {
    let isFlag = true;
    fetchOrders(isFlag);
    return () => {
      isFlag = false;
    };
  }, []);
  //chuyển trạng thái đơn hàng
  const handleNextState = async (id: number, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = currentStatus;

    switch (currentStatus) {
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
      await updateOrderStatus(id, nextStatus);
      await fetchOrders();
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng", [
        {
          text: "Thử lại",
          onPress: () => handleNextState(id, currentStatus),
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF7622" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <CustomButton
          title="Thử lại"
          onPress={() => fetchOrders()}
          buttonStyle={styles.retryButton}
          textStyle={styles.retryText}
        />
      </View>
    );
  }

  //hủy đơn hàng
  const handleCancelOrder = async (id: number) => {
    try {
      setActionLoading(true);
      await updateOrderStatus(id, "cancelled");
      await fetchOrders();
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng", [
        {
          text: "Thử lại",
          onPress: () => handleCancelOrder(id),
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>

      {/* tab */}
      <View style={styles.tabs}>
        <TopTabButton
          iconName="time-outline"
          active={activeTab === "pending"}
          onPress={() => setActiveTab("pending")}
        />
        <TopTabButton
          iconName="restaurant-outline"
          active={activeTab === "preparing"}
          onPress={() => setActiveTab("preparing")}
        />
        <TopTabButton
          iconName="bicycle-outline"
          active={activeTab === "delivering"}
          onPress={() => setActiveTab("delivering")}
        />
        <TopTabButton
          iconName="checkmark-done-outline"
          active={activeTab === "completed"}
          onPress={() => setActiveTab("completed")}
        />
        <TopTabButton
          iconName="close-circle-outline"
          active={activeTab === "cancelled"}
          onPress={() => setActiveTab("cancelled")}
        />
      </View>

      {/* list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {filteredOrders.map((item) => (
          <OrderCard
            key={item.id}
            status={item.status}
            customerName={item.customer.fullname}
            customerId={item.customer.id}
            totalPrice={item.payment.amount}
            avatarUrl={item.customer.avatarUrl}
            time={new Date(item.created_at)}
            onPress={() =>
              navigation.getParent()?.navigate("OrderDetail", {
                order: item,
              })
            }
            onActionPress={() => handleNextState(item.id, item.status)}
            onCancelPress={() => handleCancelOrder(item.id)}
          />
        ))}
      </ScrollView>
      {actionLoading && (
        <View style={styles.overlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FF7622" />

            <Text style={styles.loadingText}>Đang cập nhật đơn hàng...</Text>
          </View>
        </View>
      )}
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

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 24,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    marginBottom: 24,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    fontSize: 16,
    color: "#B1B1B1",
    textAlign: "center",
    marginBottom: 16,
  },

  loadingBox: {
    width: 260,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#111",
    textAlign: "center",
  },

  retryButton: {
    backgroundColor: "#FF7622",
    marginTop: 16,
    width: "50%",
  },

  retryText: {
    color: "white",
  },
});
