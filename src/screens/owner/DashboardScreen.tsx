import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import LogoutButton from "../../components/LogoutButton";
import { getDashboardStats } from "../../services/dashboard.service";
import { formatCurrency } from "../../utils/formatters";
import { LineChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";

export default function DashboardScreen() {
  const [runningOrders, setRunningOrders] = useState(0);
  const [requests, setRequests] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueChart, setRevenueChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartWidth, setChartWidth] = useState(0);
  const [popularFoods, setPopularFoods] = useState<any[]>([]);
  const navigation = useNavigation<any>();
  const loadDashboard = async () => {
    try {
      //lấy số order theo ngày hiện tại
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endToday = new Date();
      const todayStats = await getDashboardStats(
        today.toISOString(),
        endToday.toISOString(),
      );
      setRunningOrders(
        todayStats.total_orders -
          todayStats.completed_orders -
          todayStats.cancelled_orders,
      );
      setRequests(
        todayStats.orders_by_status.find((item) => item.status === "pending")
          ?.count ?? 0,
      );
      //lấy doanh thu theo tuần
      const now = new Date();
      const monday = new Date(now);
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      monday.setDate(now.getDate() + diff);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      const currentWeek = await getDashboardStats(
        monday.toISOString(),
        sunday.toISOString(),
      );
      setTotalRevenue(currentWeek.total_revenue);
      const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const revenueMap = new Map();
      currentWeek.revenue_by_date.forEach((item) => {
        const date = new Date(item.date);
        const weekday = date.getDay();
        revenueMap.set(weekday, item.revenue);
      });
      setRevenueChart({
        labels: weekLabels,
        datasets: [
          {
            data: [
              revenueMap.get(1) ?? 0,
              revenueMap.get(2) ?? 0,
              revenueMap.get(3) ?? 0,
              revenueMap.get(4) ?? 0,
              revenueMap.get(5) ?? 0,
              revenueMap.get(6) ?? 0,
              revenueMap.get(0) ?? 0,
            ],
          },
        ],
      });
      //top món ăn
      setPopularFoods(currentWeek.top_selling_foods);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadDashboard();
  }, []);
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <LogoutButton />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* count orders */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Today</Text>
            </View>
            <Text style={styles.statNumber}>{runningOrders}</Text>
            <Text style={styles.statLabel}>RUNNING ORDERS</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Today</Text>
            </View>
            <Text style={styles.statNumber}>{requests}</Text>
            <Text style={styles.statLabel}>ORDER REQUESTS</Text>
          </View>
        </View>
        {/* revenus */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View>
              <Text style={styles.revenueTitle}>Total Revenue</Text>
              <Text style={styles.revenueAmount}>
                {formatCurrency(totalRevenue, "VND").toLocaleString()}
              </Text>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.detailLink}>See Details</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>This Week</Text>
              </View>
            </View>
          </View>
          <View
            onLayout={(event) => {
              setChartWidth(event.nativeEvent.layout.width);
            }}
          >
            {revenueChart &&
              revenueChart.datasets[0].data.length > 0 &&
              chartWidth > 0 && (
                <LineChart
                  data={revenueChart}
                  width={chartWidth}
                  height={220}
                  withDots
                  withShadow={false}
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLines={false}
                  bezier
                  chartConfig={{
                    backgroundGradientFrom: "#FFF",
                    backgroundGradientTo: "#FFF",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255,118,34,${opacity})`,
                    labelColor: () => "#9CA3AF",
                    propsForDots: {
                      r: "5",
                      strokeWidth: "2",
                      stroke: "#FF7622",
                    },
                  }}
                  style={{
                    marginTop: 20,
                    borderRadius: 16,
                  }}
                />
              )}
          </View>
        </View>
        {/* popular items */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueTitle}>Popular Items</Text>
            <View style={styles.rightSection}>
              <TouchableOpacity
                onPress={() => navigation.navigate("PopularItems")}
              >
                <Text style={styles.detailLink}>See Details</Text>
              </TouchableOpacity>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>This Week</Text>
              </View>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.foodList}
          >
            {popularFoods.map((food) => (
              <View key={food.food_id} style={styles.foodItem}>
                <Image
                  source={
                    food.image_url
                      ? { uri: food.image_url }
                      : require("../../../assets/default-food.png")
                  }
                  style={styles.foodImage}
                />
                <Text numberOfLines={1} style={styles.foodName}>
                  {food.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginTop: 24,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "flex-start",
  },
  statNumber: {
    fontSize: 40,
    fontWeight: "800",
    color: "#181C2E",
    textAlign: "left",
  },
  statLabel: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "700",
    color: "#A0A5BA",
    textTransform: "uppercase",
  },
  revenueCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  revenueTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#181C2E",
  },
  revenueAmount: {
    fontSize: 25,
    fontWeight: "700",
    color: "#181C2E",
    marginTop: 4,
  },
  detailLink: {
    color: "#FF7622",
    fontSize: 12,
    fontWeight: "600",
  },
  chartPlaceholder: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  badge: {
    backgroundColor: "#E9FFF0",
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 5,
  },
  badgeText: {
    color: "#22C55E",
    fontWeight: "700",
    fontSize: 10,
  },
  statHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodList: {
    paddingTop: 20,
  },
  foodItem: {
    width: 110,
    marginRight: 14,
  },
  foodImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
  },
  foodName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#181C2E",
  },
});
