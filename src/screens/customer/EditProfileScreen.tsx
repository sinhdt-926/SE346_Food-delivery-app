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
import * as ImagePicker from "expo-image-picker";
import CustomHeader from "../../components/CustomHeader";
import FormInput from "../../components/FormInput";
import UserHeader from "../../components/UserHeader";
import { useAuthStore } from "../../store/useAuthStore";
import { authService } from "../../services/auth.service";

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateProfile } = useAuthStore();

  const initialData = {
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    imageUrl: user?.user_metadata?.image_url || user?.publicProfile?.image_url || "",
  };

  const [formData, setFormData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const isChanged =
    formData.fullName !== initialData.fullName ||
    formData.email !== initialData.email ||
    formData.phone !== initialData.phone ||
    formData.imageUrl !== initialData.imageUrl;

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Lỗi quyền truy cập",
          text2: "Vui lòng cấp quyền truy cập thư viện ảnh để đổi Avatar.",
          topOffset: 60,
        });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setFormData({ ...formData, imageUrl: result.assets[0].uri });
      }
    } catch (error) {
      console.error("Lỗi chọn ảnh:", error);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Vui lòng nhập đầy đủ thông tin",
          visibilityTime: 2000,
          topOffset: 60,
        });
        setIsSaving(false);
        return;
      }

      let finalImageUrl = formData.imageUrl;
      // Nếu là ảnh mới chọn từ máy (có prefix file://)
      if (formData.imageUrl && formData.imageUrl.startsWith("file")) {
        finalImageUrl = await authService.uploadAvatar(formData.imageUrl);
      }

      const payload: { fullName: string; phone: string; email?: string; imageUrl?: string } = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        imageUrl: finalImageUrl,
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
      <CustomHeader title="Chỉnh sửa thông tin" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <UserHeader
          name={formData.fullName}
          imageUrl={formData.imageUrl}
          showEditBadge={true}
          onEditPress={pickImage}
        />

        <FormInput
          label="HỌ VÀ TÊN"
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
          label="SỐ ĐIỆN THOẠI"
          value={formData.phone}
          keyboardType="phone-pad"
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          style={styles.customInput}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (isSaving || !isChanged) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving || !isChanged}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>LƯU</Text>
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
    backgroundColor: "#e1e0deff",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
