import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import CustomHeader from "../../components/CustomHeader";
import FormInput from "../../components/FormInput";
import UserHeader from "../../components/UserHeader";
import { useAuthStore } from "../../store/useAuthStore";

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload: { fullName: string; phone: string; email?: string } = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
      };

      // Chỉ gửi email nếu có thay đổi
      if (formData.email.trim() !== (user?.email || "")) {
        payload.email = formData.email.trim();
      }

      await updateProfile(payload);

      Toast.show({
        type: "success",
        text1: "Lưu thành công",
        text2: "Thông tin hồ sơ đã được cập nhật.",
        visibilityTime: 2500,
        topOffset: 60,
      });

      // Đợi Toast hiển thị rồi mới goBack
      setTimeout(() => {
        navigation.goBack();
      }, 600);
    } catch (error: any) {
      console.error("Lỗi khi lưu profile:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error?.message || "Không thể cập nhật thông tin. Vui lòng thử lại.",
        visibilityTime: 3000,
        topOffset: 60,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Edit Profile" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <UserHeader name={formData.fullName} showEditBadge={true} />

        <FormInput
          label="FULL NAME"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          style={styles.customInput}
          autoCapitalize="words"
        />

        <FormInput
          label="EMAIL"
          value={formData.email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          style={styles.customInput}
        />

        <FormInput
          label="PHONE NUMBER"
          value={formData.phone}
          keyboardType="phone-pad"
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          style={styles.customInput}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>SAVE</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 20 },
  customInput: {
    backgroundColor: "#F3F4F8",
    borderWidth: 0,
    borderRadius: 10,
  },
  footer: { padding: 20 },
  saveButton: {
    backgroundColor: "#FF8A00",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#FFBA6B",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
