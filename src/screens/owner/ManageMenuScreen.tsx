import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import TopTabButton from "../../components/TopTabButton";
import { useNavigation } from "@react-navigation/native";
import { MenuStatus } from "../../types/cart";

export default function ManagerMenuScreen() {
  const [activeTab, setActiveTab] = useState<MenuStatus>("all");
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>

      <View style={styles.tabs}>
        <TopTabButton
          title="All"
          active={activeTab === "all"}
          onPress={() => setActiveTab("all")}
        />
        <TopTabButton
          title="Fastfood"
          active={activeTab === "fastfood"}
          onPress={() => setActiveTab("fastfood")}
        />
        <TopTabButton
          title="Dessert"
          active={activeTab === "dessert"}
          onPress={() => setActiveTab("dessert")}
        />
        <TopTabButton
          title="Drink"
          active={activeTab === "drink"}
          onPress={() => setActiveTab("drink")}
        />
      </View>
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
