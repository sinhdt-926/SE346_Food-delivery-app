import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../../services/auth.service";

const HomeScreen = () => {
  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.deliverToText}>DELIVER TO</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={18} color="#FF7622" />
                <Text style={styles.locationText}>Khu B - UIT, Thủ Đức</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color="#A0A5BA" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search dishes, restaurants"
                placeholderTextColor="#A0A5BA"
              />
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="options-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Categories</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All {">"}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriesRow}>
                {[
                  {
                    name: "Pizza",
                    img: "https://cdn-icons-png.flaticon.com/512/3595/3595455.png",
                  },
                  {
                    name: "Burger",
                    img: "https://cdn-icons-png.flaticon.com/512/706/706918.png",
                  },
                  {
                    name: "Drink",
                    img: "https://cdn-icons-png.flaticon.com/512/2405/2405479.png",
                  },
                  {
                    name: "Chicken",
                    img: "https://cdn-icons-png.flaticon.com/512/3141/3141081.png",
                  },
                ].map((item, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryIconBox}>
                      <Image
                        source={{ uri: item.img }}
                        style={styles.categoryImg}
                      />
                    </View>
                    <Text style={styles.categoryText}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Open Restaurants</Text>

            <View style={styles.restaurantCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000",
                }}
                style={styles.restaurantImg}
              />
              <View style={styles.restaurantInfo}>
                <View style={styles.restaurantRow}>
                  <Text style={styles.restaurantName}>Rose Garden Pizza</Text>
                  <View style={styles.ratingBox}>
                    <Ionicons name="star" size={14} color="#FF7622" />
                    <Text style={styles.ratingText}>4.7</Text>
                  </View>
                </View>
                <Text style={styles.restaurantDesc}>
                  Italian • Pizza • 20-30 min
                </Text>

                <View style={styles.tagsRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Free Delivery</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>10% OFF</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#181C2E" },
  container: { flex: 1, backgroundColor: "#F8F9FB" },

  // Header
  header: {
    backgroundColor: "#181C2E",
    padding: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliverToText: {
    color: "#FF7622",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  locationText: { color: "#FFF", fontSize: 18, fontWeight: "600" },
  headerActions: { flexDirection: "row", gap: 10 },
  iconBtn: { backgroundColor: "#2C2F3E", padding: 10, borderRadius: 20 },

  // Search Bar
  searchContainer: { flexDirection: "row", marginTop: 25, gap: 10 },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2F3E",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    gap: 10,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 15 },
  filterBtn: {
    backgroundColor: "#FF7622",
    width: 55,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Content
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#32343E" },
  seeAllText: { color: "#FF7622", fontSize: 14 },

  // Categories
  categoriesRow: { flexDirection: "row", gap: 15 },
  categoryItem: { alignItems: "center", gap: 8 },
  categoryIconBox: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryImg: { width: 40, height: 40 },
  categoryText: { fontWeight: "600", color: "#32343E", fontSize: 14 },

  // Restaurant Card
  restaurantCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 15,
  },
  restaurantImg: { width: "100%", height: 160 },
  restaurantInfo: { padding: 15 },
  restaurantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  restaurantName: { fontSize: 18, fontWeight: "bold", color: "#32343E" },
  ratingBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontWeight: "bold", fontSize: 14, color: "#32343E" },
  restaurantDesc: { color: "#646982", fontSize: 14, marginBottom: 10 },
  tagsRow: { flexDirection: "row", gap: 10 },
  tag: {
    backgroundColor: "#F0F5FA",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  tagText: { fontSize: 12, color: "#32343E", fontWeight: "500" },
});

export default HomeScreen;
