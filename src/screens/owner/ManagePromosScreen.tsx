import React, { useRef, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import LogoutButton from "../../components/LogoutButton";
import TopTabButton from "../../components/TopTabButton";
import PromotionCard from "../../components/PromotionCard";
import { Promotion } from "../../types/promotion";
import { getAllPromotions } from "../../services/promotion.service";
import CustomButton from "../../components/CustomButton";

export default function ManagerPromosScreen() {
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "expired">(
    "active",
  );
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();
  const isFlag = useRef(true);
  useFocusEffect(
    React.useCallback(() => {
      isFlag.current = true;
      fetchPromotions();
      return () => {
        isFlag.current = false;
      };
    }, []),
  );

  const fetchPromotions = async () => {
    try {
      if (promos.length === 0) {
        setLoading(true);
      }
      setError("");
      const data = await getAllPromotions();
      if (isFlag.current) {
        setPromos(data ?? []);
      }
    } catch (err) {
      console.log(err);
      if (isFlag.current) {
        setError("Cannot load promotions");
      }
    } finally {
      if (isFlag.current) {
        setLoading(false);
      }
    }
  };

  const filteredPromos = useMemo(() => {
    const now = new Date();

    // Active
    if (activeTab === "active") {
      return promos.filter(
        (promo) =>
          new Date(promo.start_date) <= now && new Date(promo.end_date) >= now,
      );
    }

    // Upcoming
    if (activeTab === "upcoming") {
      return promos.filter((promo) => new Date(promo.start_date) > now);
    }

    // Expired
    return promos.filter((promo) => new Date(promo.end_date) < now);
  }, [promos, activeTab]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await getAllPromotions();
      if (isFlag.current) {
        setPromos(data ?? []);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải lại danh sách khuyến mãi", [
        {
          text: "Thử lại",
          onPress: () => handleRefresh(),
        },
      ]);
    } finally {
      if (isFlag.current) {
        setRefreshing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>Promos</Text>
        <LogoutButton />
      </View>

      {/* tabs */}
      <View style={styles.tabs}>
        <TopTabButton
          title="Active"
          active={activeTab === "active"}
          onPress={() => setActiveTab("active")}
        />
        <TopTabButton
          title="Upcoming"
          active={activeTab === "upcoming"}
          onPress={() => setActiveTab("upcoming")}
        />
        <TopTabButton
          title="Expired"
          active={activeTab === "expired"}
          onPress={() => setActiveTab("expired")}
        />
      </View>

      {/* count */}
      <View style={styles.subContainer}>
        <Text style={styles.countText}>{filteredPromos.length} promos</Text>
        <View style={styles.actionButtons}>
          {/* add */}
          <CustomButton
            iconName="add"
            iconType="ion"
            iconColor="white"
            onPress={() => navigation.navigate("AddEditPromotion" as never)}
            buttonStyle={styles.iconButton}
          />

          {/* refresh */}
          <CustomButton
            iconName="refresh"
            iconType="ion"
            iconColor="white"
            onPress={handleRefresh}
            isLoading={refreshing}
            disabled={refreshing}
            buttonStyle={styles.iconButton}
          />
        </View>
      </View>

      {/* loading */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
          }}
        >
          {filteredPromos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No promotions found</Text>
            </View>
          ) : (
            filteredPromos.map((promo) => (
              <PromotionCard
                key={promo.id}
                promo={promo}
                status={activeTab}
                onPress={() =>
                  navigation.navigate("AddEditPromotion", {
                    promotion: promo,
                  })
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  header: {
    width: "100%",
    backgroundColor: "#181C2E",
    paddingTop: 65,
    paddingBottom: 28,
    paddingHorizontal: 24,
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

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF7622",
  },

  tabs: {
    marginHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    marginBottom: 20,
  },

  subContainer: {
    marginHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  countText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    fontSize: 16,
    color: "#B1B1B1",
  },

  emptyContainer: {
    marginTop: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#B1B1B1",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    paddingVertical: 0,
  },
});
