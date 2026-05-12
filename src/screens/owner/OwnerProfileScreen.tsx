import React from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import ProfileButton from "../../components/ProfileButton";
import { authService } from "../../services/auth.service";
import { useNavigation } from "@react-navigation/native";

export default function OwnerProfileScreen() {
  const navigation = useNavigation();
  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.signOut();

            navigation.reset({
              index: 0,
              routes: [{ name: "Login" as never }],
            });
          } catch (error: any) {
            console.log(error);
            Alert.alert("Lỗi", "Không thể đăng xuất", [
              {
                text: "Thử lại",
                onPress: handleLogout,
              },
              {
                text: "Đóng",
                style: "cancel",
              },
            ]);
          }
        },
      },
    ]);
  };
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* profile + settings */}
      <View style={styles.cardGroup}>
        <ProfileButton
          title="Personal Info"
          iconName="person-outline"
          iconColor="#FF7A1A"
          onPress={() => console.log("Personal Info")}
        />

        <ProfileButton
          title="Settings"
          iconName="settings-outline"
          iconColor="#5B5BFF"
          onPress={() => console.log("Settings")}
        />
      </View>

      {/* history + orders */}
      <View style={styles.cardGroup}>
        <ProfileButton
          title="Withdrawal History"
          iconName="card-outline"
          iconColor="#FF9B52"
          onPress={() => console.log("Withdrawal")}
        />

        <ProfileButton
          title="Number of Orders"
          iconName="receipt-outline"
          iconColor="#25C3F3"
          onPress={() => console.log("Orders")}
        />
      </View>

      {/* review */}
      <View style={styles.cardGroup}>
        <ProfileButton
          title="User Reviews"
          iconName="chatbubble-outline"
          iconColor="#21D4C4"
          onPress={() => console.log("Reviews")}
        />
      </View>

      {/* logout */}
      <View style={styles.cardGroup}>
        <ProfileButton
          title="Log Out"
          iconName="log-out-outline"
          iconColor="#FF4B4B"
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
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
    marginBottom: 10,
  },

  headerTitle: {
    marginLeft: 18,
    fontSize: 24,
    fontWeight: "600",
    color: "#222",
  },

  cardGroup: {
    backgroundColor: "#F2F2F2",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 15,
  },
});
