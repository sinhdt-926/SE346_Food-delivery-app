import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import TopTabButton from "../../components/TopTabButton";
import OrderCard from "../../components/OrderCard";
//test UI
type OrderStatus =
  | "pending"
  | "preparing"
  | "delivering"
  | "completed"
  | "cancelled";

interface Order {
  id: number;
  status: OrderStatus;
  customerName: string;
  customerId: string;
  totalPrice: number;
  time: string;
}

const initialOrders: Order[] = [
  {
    id: 1,
    status: "pending",
    customerName: "Chicken Thai Biriyani",
    customerId: "32053",
    totalPrice: 60,
    time: "20 mins ago",
  },

  {
    id: 2,
    status: "preparing",
    customerName: "Pizza Pepperoni",
    customerId: "32054",
    totalPrice: 45,
    time: "35 mins ago",
  },

  {
    id: 3,
    status: "delivering",
    customerName: "Hamburger",
    customerId: "32055",
    totalPrice: 30,
    time: "1 hour ago",
  },

  {
    id: 4,
    status: "completed",
    customerName: "Fried Chicken",
    customerId: "32056",
    totalPrice: 80,
    time: "Yesterday",
  },

  {
    id: 5,
    status: "cancelled",
    customerName: "Beef Steak",
    customerId: "32057",
    totalPrice: 55,
    time: "Yesterday",
  },
];

export default function ManagerOrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("pending");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const filteredOrders = orders.filter((item) => item.status === activeTab);

  //chuyển trạng thái đơn hàng
  const handleNextState = (id: number) => {
    setOrders((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        switch (item.status) {
          case "pending":
            return {
              ...item,
              status: "preparing",
            };

          case "preparing":
            return {
              ...item,
              status: "delivering",
            };

          case "delivering":
            return {
              ...item,
              status: "completed",
            };
          default:
            return item;
        }
      }),
    );
  };

  //hủy đơn hàng
  const handleCancelOrder = (id: number) => {
    setOrders((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "cancelled",
            }
          : item,
      ),
    );
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
            customerName={item.customerName}
            customerId={item.customerId}
            totalPrice={item.totalPrice}
            time={item.time}
            onPress={() => console.log("detail order")}
            onActionPress={() => handleNextState(item.id)}
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
