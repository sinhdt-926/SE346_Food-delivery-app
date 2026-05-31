import React, { useEffect } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import MenuItem from "../../components/MenuItem";
import UserHeader from "../../components/UserHeader";
import { useAuthStore } from "../../store/useAuthStore";
import { authService } from "../../services/auth.service";

export default function ProfileScreen({ navigation }: any) {
  const { user, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Profile" showBackButton={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Khối Avatar dùng chung */}
        <UserHeader
          name={user?.user_metadata?.full_name}
        />

        {/* Khối Card 1 */}
        <View style={styles.cardGroup}>
          <MenuItem
            iconName="person-outline"
            label="Personal Info"
            onPress={() => navigation.navigate("PersonalInfo")}
          />
          <MenuItem
            iconName="map-outline"
            label="Addresses"
            onPress={() => navigation.navigate("MyAddress")}
          />
        </View>

        {/* Khối Card 2 */}
        <View style={styles.cardGroup}>
          <MenuItem iconName="cart-outline" label="Cart" onPress={() => { }} />
          <MenuItem
            iconName="heart-outline"
            label="Favourite"
            onPress={() => { }}
          />
          <MenuItem
            iconName="notifications-outline"
            label="Notifications"
            onPress={() => { }}
          />
        </View>

        {/* Khối Card 3 (Log Out) */}
        <View style={styles.cardGroup}>
          <MenuItem
            iconName="log-out-outline"
            label="Log Out"
            showChevron={true}
            onPress={() => authService.signOut()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F5F9" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  cardGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    paddingVertical: 8,
  },
});
