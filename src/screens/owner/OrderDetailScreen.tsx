import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import BackButton from "../../components/BackButton";
import CustomButton from "../../components/CustomButton";
import { useRoute, useNavigation } from "@react-navigation/native";

type OrderStatus =
  | "pending"
  | "preparing"
  | "delivering"
  | "completed"
  | "cancelled";

interface Order {
  id: number;

  created_at: string;

  status: OrderStatus;

  delivery_address: string;

  customer: {
    id: string;

    fullname: string;

    phone_number: string;
  };

  order_details: {
    id: number;

    quantity: number;

    note?: string;

    price: number;

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

export default function OrderDetailScreen() {
  // testUI
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { order } = route.params;
  const [currentOrder, setCurrentOrder] = useState<Order>(order);

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
    switch (order.status) {
      case "pending":
        return "Confirm";

      case "preparing":
        return "Deliver";

      case "delivering":
        return "Complete";

      default:
        return null;
    }
  };
  const updateParentOrder = (newStatus: OrderStatus) => {
    route.params.order.status = newStatus;
  };
  //thay đổi trạng thái đơn hàng
  const handleNextState = () => {
    setCurrentOrder((prev) => {
      let nextStatus: OrderStatus = prev.status;

      switch (prev.status) {
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

      route.params.order.status = nextStatus;

      return {
        ...prev,
        status: nextStatus,
      };
    });
  };

  //hủy đơn hàng
  const handleCancelOrder = () => {
    route.params.order.status = "cancelled";

    setCurrentOrder((prev) => ({
      ...prev,
      status: "cancelled",
    }));
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

        <Text style={styles.title}>Order Details</Text>
      </View>

      {/* state */}
      <View style={styles.statusCard}>
        <Text style={styles.orderId}>Order #{currentOrder.id}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {currentOrder.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* customer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <InfoRow label="Name" value={currentOrder.customer.fullname} />
        <InfoRow label="Phone" value={currentOrder.customer.phone_number} />
        <InfoRow label="Customer ID" value={currentOrder.customer.id} />
      </View>

      {/* address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.address}>{currentOrder.delivery_address}</Text>
      </View>

      {/* items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ordered Items</Text>

        {currentOrder.order_details.map((item: any) => (
          <FoodItem
            key={item.id}
            name={item.food.name}
            quantity={item.quantity}
            price={item.subtotal}
            note={item.note}
          />
        ))}
      </View>

      {/* payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <InfoRow label="Payment Type" value={currentOrder.payment.type} />
        <InfoRow label="Payment Status" value={currentOrder.payment.status} />
        <View style={styles.divider} />
        <InfoRow label="Total" value={`${currentOrder.payment.amount}`} bold />
      </View>
      {currentOrder.status !== "completed" &&
        currentOrder.status !== "cancelled" && (
          <View style={styles.buttonRow}>
            <CustomButton
              title={getActionTitle()!}
              onPress={handleNextState}
              buttonStyle={styles.doneButton}
            />

            <CustomButton
              title="Cancel"
              buttonStyle={styles.cancelButton}
              onPress={handleCancelOrder}
              textStyle={styles.cancelText}
            />
          </View>
        )}
    </ScrollView>
  );
}

function InfoRow({ label, value, bold }: any) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>

      <Text style={[styles.value, bold && styles.boldValue]}>{value}</Text>
    </View>
  );
}

function FoodItem({ name, quantity, price, note }: any) {
  return (
    <View style={styles.foodItem}>
      <View>
        <Text style={styles.foodName}>{name}</Text>
        <Text style={styles.foodQty}>Qty: {quantity}</Text>
        {note ? <Text style={styles.note}>Note: {note}</Text> : null}
      </View>
      <Text style={styles.foodPrice}>${price}</Text>
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
    fontSize: 15,
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

  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
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
});
