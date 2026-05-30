import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import LogoutButton from "../../components/LogoutButton";
import {
  getRequestsCount,
  getRunningOrdersCount,
} from "../../services/order.service";
import {
  getTodayRevenue,
  getTodayRevenueChart,
} from "../../services/revenue.service";
import { formatCurrency } from "../../utils/formatters";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function DashboardScreen() {
  const [runningOrders, setRunningOrders] = useState(0);
  const [requests, setRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueChart, setRevenueChart] = useState<any>(null);
  const loadDashboard = async () => {
    try {
      const running = await getRunningOrdersCount();
      const requests = await getRequestsCount();
      setRunningOrders(running);
      setRequests(requests);
      const revenue = await getTodayRevenue();
      setTotalRevenue(revenue);
      const chart = await getTodayRevenueChart();
      setRevenueChart(chart);
    } catch (error) {
      Alert.alert("Error", "Failed to load dashboard");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadDashboard();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <LogoutButton />
      </View>
      {/* count orders */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{runningOrders}</Text>
          <Text style={styles.statLabel}>RUNNING ORDERS</Text>
        </View>
        <View style={styles.statCard}>
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
          <Text style={styles.detailLink}>See Details</Text>
        </View>
        {revenueChart && (
          <LineChart
            data={revenueChart}
            width={Dimensions.get("window").width - 88}
            height={220}
            withDots={true}
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
});
