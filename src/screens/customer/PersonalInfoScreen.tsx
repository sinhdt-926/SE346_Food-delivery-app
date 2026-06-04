import React from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import UserHeader from "../../components/UserHeader";
import { useAuthStore } from "../../store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";

export default function PersonalInfoScreen({ navigation }: any) {
  const { user } = useAuthStore();

  const InfoRow = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: any;
    label: string;
    value: string;
    color: string;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="THÔNG TIN"
        rightActionLabel="Sửa"
        onRightActionPress={() => navigation.navigate("EditProfile")}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <UserHeader
          name={user?.user_metadata?.full_name || ""}
          imageUrl={user?.user_metadata?.image_url || user?.publicProfile?.image_url || undefined}
        />

        <View style={styles.card}>
          <InfoRow
            icon="person-outline"
            label="HỌ VÀ TÊN"
            value={user?.user_metadata?.full_name || ""}
            color="#4A90E2"
          />
          <InfoRow
            icon="mail-outline"
            label="EMAIL"
            value={user?.email || ""}
            color="#c13429ff"
          />
          <InfoRow
            icon="call-outline"
            label="SỐ ĐIỆN THOẠI"
            value={user?.user_metadata?.phone || ""}
            color="#62e051ff"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F5F9" },
  content: { paddingHorizontal: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8F8FB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: { flex: 1 },
  label: {
    fontSize: 12,
    color: "#A0A5BA",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  value: { fontSize: 15, color: "#1E1E1E", fontWeight: "500" },
});
