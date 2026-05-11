import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import TopTabButton from "../../components/TopTabButton";
import OrderCard from "../../components/OrderCard";
import { useNavigation } from "@react-navigation/native";
import {
  getOwnerOrders,
  updateOrderStatus,
} from "../../services/order.service";
import { Order, OrderStatus } from "../../types/order";

export default function ManagerOrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("pending");
  const [orders, setOrders] = useState<Order[]>([]);
  const filteredOrders = orders.filter((item) => item.status === activeTab);
  const navigation = useNavigation<any>();

  //load data
  const fetchOrders = async () => {
    try {
      const data = await getOwnerOrders();
      const formattedOrders = data.map((order: any) => ({
        id: order.id,
        status: order.status,
        time: new Date(order.created_at),
        customer: {
          id: order.customer?.id ?? "",
          fullname: order.customer?.fullname ?? "",
          phone_number: order.customer?.phone_number ?? "",
          avatarUrl: order.customer?.avatarUrl ?? "",
        },
        delivery_address: order.address,
        order_details: order.items.map((item: any, index: number) => ({
          id: index,
          quantity: item.quantity,
          note: item.note,
          subtotal: item.subtotal,
          food: {
            id: index,
            name: item.name,
          },
        })),

        payment: {
          id: order.payment?.id ?? 0,
          type: order.payment?.type ?? "cash",
          amount: order.payment?.amount ?? 0,
          status: order.payment?.status ?? "unpaid",
        },
      }));
      setOrders(formattedOrders);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchOrders();
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
      await updateOrderStatus(id, nextStatus);
      await fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  //hủy đơn hàng
  const handleCancelOrder = async (id: number) => {
    await updateOrderStatus(id, "cancelled");
    fetchOrders();
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
            time={item.time}
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
});
