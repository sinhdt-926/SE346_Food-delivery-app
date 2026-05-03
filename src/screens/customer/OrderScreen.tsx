import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import OrderItem from "../../components/OrderItem";
import { getMyOrders } from "../../services/order.service";

// Tạo một component List dùng chung cho cả hai tab
const OrderList = ({
  data,
  type,
  onRefresh,
  refreshing,
}: {
  data: any[];
  type: "ongoing" | "history";
  onRefresh: () => void;
  refreshing: boolean;
}) => (
  <View style={styles.listContainer}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {data.length === 0 ? (
        <Text style={styles.emptyText}>No {type} orders found.</Text>
      ) : (
        data.map((order) => (
          <OrderItem
            key={`${type}-${order.id}`}
            type={type}
            order={order}
            // Các hàm này có thể được truyền từ props nếu cần logic xử lý thật
            onViewDetail={() => console.log("View Detail", order.id)}
            onTrackOrder={() => console.log("Track Order", order.id)}
            onCancel={() => console.log("Cancel Order", order.id)}
            onRate={() => console.log("Rate Order", order.id)}
            onReOrder={() => console.log("Re-Order", order.id)}
          />
        ))
      )}
    </ScrollView>
  </View>
);

const Tab = createMaterialTopTabNavigator();

const OrderScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm gọi API
  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Xử lý làm mới (pull to refresh)
  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Phân loại đơn hàng
  // ongoing: delivering, preparing
  // history: completed, canceled
  const ongoingOrders = orders.filter(
    (order) => order.status === "delivering" || order.status === "preparing",
  );
  const historyOrders = orders.filter(
    (order) => order.status === "completed" || order.status === "canceled",
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#181C2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#181C2E" />
        </TouchableOpacity>
      </View>

      {/* --- CONTENT --- */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : (
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: "#FF7622",
            tabBarInactiveTintColor: "#A0A5BA",
            tabBarIndicatorStyle: {
              backgroundColor: "#FF7622",
              height: 2,
            },
            tabBarLabelStyle: {
              fontSize: 16,
              fontWeight: "bold",
              textTransform: "none",
            },
            tabBarStyle: {
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: "#F3F3F5",
              backgroundColor: "#FFFFFF",
            },
          }}
        >
          <Tab.Screen
            name="Ongoing"
            children={() => (
              <OrderList
                data={ongoingOrders}
                type="ongoing"
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            )}
          />
          <Tab.Screen
            name="History"
            children={() => (
              <OrderList
                data={historyOrders}
                type="history"
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            )}
          />
        </Tab.Navigator>
      )}
    </SafeAreaView>
  );
};

export default OrderScreen;

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#F9F9FB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 45,
    height: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#181C2E",
    marginLeft: 15,
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#F9F9FB",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#A0A5BA",
    marginTop: 50,
    fontSize: 16,
  },
});
