import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getDashboardStats } from "../../services/dashboard.service";
import BackButton from "../../components/BackButton";
import { formatCurrency } from "../../utils/formatters";
import { LineChart } from "react-native-chart-kit";
import {
  buildRevenueChart,
  getCurrentWeekRange,
  getMonthRange,
} from "../../utils/chart";

export default function RevenusMonthScreen() {
  const [weekChart, setWeekChart] = useState<any>(null);
  const [monthChart, setMonthChart] = useState<any>(null);
  const [weekRevenue, setWeekRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const loadRevenus = async () => {
    try {
      const { startDate, endDate } = getCurrentWeekRange();
      const currentWeek = await getDashboardStats(startDate, endDate);
      setWeekRevenue(currentWeek.total_revenue);
      setWeekChart(buildRevenueChart(currentWeek.revenue_by_date, "week"));
      const { startDateInMonth, endDateInMonth, daysInMonth } =
        getMonthRange(selectedMonth);
      const month = await getDashboardStats(startDateInMonth, endDateInMonth);
      setMonthRevenue(month.total_revenue);
      setMonthChart(
        buildRevenueChart(month.revenue_by_date, "month", daysInMonth),
      );
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadRevenus();
  }, [selectedMonth]);
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
        <BackButton />
        <Text style={styles.headerTitle}>Revenus</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* this week */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View>
              <Text style={styles.revenueTitle}>This Week</Text>
              <Text style={styles.revenueAmount}>
                {formatCurrency(weekRevenue, "VND").toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View
            onLayout={(event) => {
              setChartWidth(event.nativeEvent.layout.width);
            }}
          >
            {weekChart &&
              weekChart.datasets[0].data.length > 0 &&
              chartWidth > 0 && (
                <LineChart
                  data={weekChart}
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
        {/* month */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View>
              <Text style={styles.revenueTitle}>Monthly Revenue</Text>
              <Text style={styles.revenueAmount}>
                {formatCurrency(monthRevenue, "VND").toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.monthSelector}
            onPress={() => setShowMonthPicker(!showMonthPicker)}
          >
            <Text style={styles.monthText}>{months[selectedMonth - 1]}</Text>
            <Text>▼</Text>
          </TouchableOpacity>
          {showMonthPicker && (
            <View style={styles.monthDropdown}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={styles.monthItem}
                  onPress={() => {
                    setSelectedMonth(index + 1);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text>{month}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View
            onLayout={(event) => {
              setChartWidth(event.nativeEvent.layout.width);
            }}
          >
            {monthChart &&
              monthChart.datasets[0].data.length > 0 &&
              chartWidth > 0 && (
                <LineChart
                  data={monthChart}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#181C2E",
    marginRight: 40,
  },
  revenueCard: {
    minHeight: 360,
    backgroundColor: "#FFF",
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
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  monthDropdown: {
    marginTop: 10,
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  monthItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  monthText: {
    fontWeight: "600",
  },
  divider: {
    height: 2,
    backgroundColor: "#F3F4F6",
    marginTop: 10,
    marginBottom: 10,
  },
});
