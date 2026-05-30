import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import LogoutButton from "../../components/LogoutButton";
import {
  getRequestsCount,
  getRunningOrdersCount,
} from "../../services/order.service";

export default function DashboardScreen() {
  const [runningOrders, setRunningOrders] = useState(0);
  const [requests, setRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const loadDashboard = async () => {
    try {
      const running = await getRunningOrdersCount();
      const requests = await getRequestsCount();
      setRunningOrders(running);
      setRequests(requests);
    } catch (error) {
      Alert.alert("Error", "Failed to load dashboard");
      console.log(error);
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
});
