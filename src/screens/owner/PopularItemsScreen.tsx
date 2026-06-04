import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import { getDashboardStats } from "../../services/dashboard.service";
import BackButton from "../../components/BackButton";

export default function PopularItemsScreen() {
  const [popularFoods, setPopularFoods] = useState<any[]>([]);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
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
    setPopularFoods(currentWeek.top_selling_foods);
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Món Ăn Phổ Biến</Text>
      </View>
      <FlatList
        data={popularFoods}
        keyExtractor={(item) => item.food_id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.itemCard}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <Image
              source={
                item.image_url
                  ? { uri: item.image_url }
                  : require("../../../assets/default-food.png")
              }
              style={styles.image}
            />
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={styles.name}>{item.name}</Text>
              </View>
              <Text style={styles.info}>Sold {item.quantity}</Text>
              <Text style={styles.revenue}>
                {item.revenue.toLocaleString()}đ
              </Text>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
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
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#181C2E",
  },
  info: {
    marginTop: 4,
    fontSize: 13,
    color: "#9CA3AF",
  },
  revenue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#181C2E",
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankBadge: {
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  rankText: {
    color: "#FF7622",
    fontWeight: "700",
    fontSize: 12,
  },
});
