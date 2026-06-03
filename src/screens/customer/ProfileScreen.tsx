import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import MenuItem from "../../components/MenuItem";
import UserHeader from "../../components/UserHeader";
import ConfirmModal from "../../components/ConfirmModal";
import { useAuthStore } from "../../store/useAuthStore";
import { authService } from "../../services/auth.service";

export default function ProfileScreen({ navigation }: any) {
  const { user, fetchUser } = useAuthStore();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="HỒ SƠ" showBackButton={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Khối Avatar dùng chung */}
        <UserHeader
          name={user?.user_metadata?.full_name}
          imageUrl={user?.user_metadata?.image_url || user?.publicProfile?.image_url || undefined}
        />

        {/* Khối Card 1 */}
        <View style={styles.cardGroup}>
          <MenuItem
            iconName="person-outline"
            label="Thông tin cá nhân"
            iconColor="#4A90E2"
            onPress={() => navigation.navigate("PersonalInfo")}
          />
          <MenuItem
            iconName="map-outline"
            label="Địa chỉ"
            iconColor="#E24A4A"
            onPress={() => navigation.navigate("MyAddress")}
          />
        </View>

        {/* Khối Card 2 */}
        <View style={styles.cardGroup}>
          <MenuItem
            iconName="cart-outline"
            label="Giỏ hàng"
            iconColor="#FF8A00"
            onPress={() => navigation.navigate('Cart')}
          />
          <MenuItem
            iconName="lock-closed-outline"
            label="Đổi mật khẩu"
            iconColor="#9B51E0"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>

        {/* Khối Card 3 (Log Out) */}
        <View style={styles.cardGroup}>
          <MenuItem
            iconName="log-out-outline"
            label="Đăng xuất"
            showChevron={true}
            iconColor="#FF3B30"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={isLogoutModalVisible}
        title="Xác nhận đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onCancel={() => setIsLogoutModalVisible(false)}
        onConfirm={() => {
          setIsLogoutModalVisible(false);
          authService.signOut();
        }}
      />
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
