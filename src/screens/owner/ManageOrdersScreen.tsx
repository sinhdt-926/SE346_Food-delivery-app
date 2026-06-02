import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getOwnerOrders,
  updateOrderStatus,
} from "../../services/order.service";
import { Order, OrderStatus } from "../../types/order";
import CustomButton from "../../components/CustomButton";
import LogoutButton from "../../components/LogoutButton";

export default function ManagerOrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("pending");
  const [orders, setOrders] = useState<Order[]>([]);
  const filteredOrders = orders
    .filter((item) => item.status === activeTab)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const isFlag = useRef(true);
  //load data
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data: Order[] = await getOwnerOrders();
      if (isFlag.current) {
        setOrders(data);
      }
    } catch (error) {
      if (isFlag.current) setError("Unable to load the order list");
    } finally {
      if (isFlag.current) setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, []),
  );
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
      Alert.alert("Error", "Unable to update order status", [
        {
          text: "Retry",
          onPress: () => handleNextState(id, currentStatus),
        },
        {
          text: "Close",
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
        <Text style={styles.loadingText}>Loading orders...</Text>
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
      Alert.alert("Error", "Unable to update order status", [
        {
          text: "Retry",
          onPress: () => handleCancelOrder(id),
        },
        {
          text: "Close",
          style: "cancel",
        },
      ]);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <LogoutButton />
      </View>

      {/* tab */}
      <View style={styles.tabs}>
        <TopTabButton
          title="Chờ xác nhận"
          iconName="time-outline"
          active={activeTab === "pending"}
          onPress={() => setActiveTab("pending")}
        />
        <TopTabButton
          title="Đang chuẩn bị"
          iconName="restaurant-outline"
          active={activeTab === "preparing"}
          onPress={() => setActiveTab("preparing")}
        />
        <TopTabButton
          title="Đang giao"
          iconName="bicycle-outline"
          active={activeTab === "delivering"}
          onPress={() => setActiveTab("delivering")}
        />
        <TopTabButton
          title="Hoàn thành"
          iconName="checkmark-done-outline"
          active={activeTab === "completed"}
          onPress={() => setActiveTab("completed")}
        />
        <TopTabButton
          title="Đã hủy"
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
            avatarUrl={item.items?.[0]?.image_url}
            time={new Date(item.created_at)}
            onPress={() =>
              navigation.getParent()?.navigate("OrderDetail", {
                order: item,
              })
            }
            onActionPress={() => handleNextState(item.id, item.status)}
            onCancelPress={() => handleCancelOrder(item.id)}
            actionLoading={actionLoading}
          />
        ))}
      </ScrollView>
      {actionLoading && (
        <View style={styles.overlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FF7622" />
            <Text style={styles.loadingText}>Updating the order...</Text>
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
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF7622",
  },

  tabs: {
    marginHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    marginBottom: 15,
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
  header: {
    width: "100%",
    backgroundColor: "#181C2E",
    paddingTop: 65,
    paddingBottom: 28,
    paddingHorizontal: 24,
    marginBottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
});
