import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import OrderItem from "../../components/OrderItem";
import { getMyOrders, subscribeToUserOrders, updateOrderStatus } from "../../services/order.service";
import { useAuthStore } from "../../store/useAuthStore";
import { formatRelativeTime } from "../../utils/formatters";

// Tạo một component List dùng chung cho cả hai tab
const OrderList = ({
  data,
  type,
  onRefresh,
  refreshing,
  onViewDetail,
  onCancel,
}: {
  data: any[];
  type: "ongoing" | "history";
  onRefresh: () => void;
  refreshing: boolean;
  onViewDetail: (order: any) => void;
  onCancel: (order: any) => void;
}) => {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.listContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {data.length === 0 ? (
          <Text style={styles.emptyText}>Không có đơn hàng nào.</Text>
        ) : (
          data.map((order) => (
            <OrderItem
              key={`${type}-${order.id}`}
              type={type}
              order={order}
              onViewDetail={() => onViewDetail(order)}
              onTrackOrder={() => {
                if (['pending', 'preparing', 'delivering'].includes(order.status)) {
                  navigation.navigate('OrderTracking', { orderId: order.id, role: 'customer' });
                }
              }}
              onCancel={() => onCancel(order)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const Tab = createMaterialTopTabNavigator();

const OrderScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

    if (!user?.id) return;

    const unsubscribe = subscribeToUserOrders(user.id, () => {
      fetchOrders();
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  // Xử lý làm mới (pull to refresh)
  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleCancelOrder = (order: any) => {
    Alert.alert(
      "Huỷ đơn hàng",
      "Bạn có chắc chắn muốn huỷ đơn hàng này không?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Có",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await updateOrderStatus(Number(order.id), 'cancelled');
              Alert.alert("Thành công", "Đã huỷ đơn hàng.");
              fetchOrders();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể huỷ đơn hàng.");
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleViewDetail = (order: any) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  // Phân loại đơn hàng
  const ongoingOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "delivering" ||
      order.status === "preparing",
  );
  const historyOrders = orders.filter(
    (order) => order.status === "completed" || order.status === "cancelled",
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
          <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#181C2E" />
        </TouchableOpacity>
      </View>

      {/* --- CONTENT --- */}
      {loading && !refreshing ? (
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
            options={{ tabBarLabel: "Đang giao" }}
            children={() => (
              <OrderList
                data={ongoingOrders}
                type="ongoing"
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onViewDetail={handleViewDetail}
                onCancel={handleCancelOrder}
              />
            )}
          />
          <Tab.Screen
            name="History"
            options={{ tabBarLabel: "Lịch sử" }}
            children={() => (
              <OrderList
                data={historyOrders}
                type="history"
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onViewDetail={handleViewDetail}
                onCancel={handleCancelOrder}
              />
            )}
          />
        </Tab.Navigator>
      )}

      {/* --- MODAL CHI TIẾT ĐƠN HÀNG --- */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#181C2E" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSubTitle}>Danh sách món ăn</Text>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <View key={idx} style={styles.modalItemRow}>
                    <Text style={styles.modalItemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.modalItemQty}>x{item.quantity}</Text>
                    <Text style={styles.modalItemPrice}>{item.price?.toLocaleString("vi-VN")}đ</Text>
                  </View>
                ))}

                <View style={styles.modalTotalRow}>
                  <Text style={styles.modalTotalText}>Tổng thanh toán:</Text>
                  <Text style={styles.modalTotalPrice}>
                    {selectedOrder.total?.toLocaleString("vi-VN")}đ
                  </Text>
                </View>

                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Trạng thái thanh toán:</Text>
                  <Text style={styles.modalInfoValue}>
                    {selectedOrder.payment?.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Phương thức:</Text>
                  <Text style={styles.modalInfoValue}>
                    {selectedOrder.payment?.type === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181C2E',
  },
  modalSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#32343E',
    marginBottom: 15,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalItemName: {
    fontSize: 15,
    color: '#32343E',
    flex: 1,
  },
  modalItemQty: {
    fontSize: 15,
    color: '#FF7622',
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  modalItemPrice: {
    fontSize: 15,
    color: '#32343E',
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'right',
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F3F5',
    marginBottom: 15,
  },
  modalTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181C2E',
  },
  modalTotalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7622',
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#A0A5BA',
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#32343E',
    fontWeight: '500',
  },
});
