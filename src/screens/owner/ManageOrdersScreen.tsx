import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import TopTabButton from "../../components/TopTabButton";
import OrderCard from "../../components/OrderCard";
import { useNavigation } from "@react-navigation/native";

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

  time: string;

  customer: {
    id: string;

    fullname: string;

    phone_number: string;
  };

  delivery_address: string;

  order_details: {
    id: number;

    quantity: number;

    note?: string;

    subtotal: number;

    food: {
      id: number;

      name: string;
    };
  }[];

  payment: {
    id: number;

    type: string;

    amount: number;

    status: string;
  };
}

const initialOrders: Order[] = [
  {
    id: 1,

    status: "pending",

    time: "20 mins ago",

    customer: {
      id: "32053",

      fullname: "John Smith",

      phone_number: "+84 123456789",
    },

    delivery_address: "123 Nguyen Trai, District 1",

    order_details: [
      {
        id: 1,

        quantity: 2,

        note: "Extra cheese",

        subtotal: 24,

        food: {
          id: 1,

          name: "Chicken Burger",
        },
      },
    ],

    payment: {
      id: 1,

      type: "cash",

      amount: 60,

      status: "paid",
    },
  },
];

export default function ManagerOrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("pending");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const filteredOrders = orders.filter((item) => item.status === activeTab);
  const navigation = useNavigation<any>();
  const [refresh, setRefresh] = useState(false);

  console.log("CURRENT:", navigation.getState());

  console.log("PARENT:", navigation.getParent()?.getState());
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
  //load lại
  const forceRefresh = () => {
    setRefresh((prev) => !prev);
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
            time={item.time}
            onPress={() =>
              navigation.getParent()?.navigate("OrderDetail", {
                order: item,
                onUpdate: forceRefresh,
              })
            }
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
