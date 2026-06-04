import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "../../components/BackButton";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/useAuthStore";
import Toast from "react-native-toast-message";

export default function ChangePasswordScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    rePassword?: string;
  }>({});

  const validate = () => {
    let isValid = true;
    let newErrors: { currentPassword?: string; newPassword?: string; rePassword?: string } = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
      isValid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
      isValid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
      isValid = false;
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
      isValid = false;
    }

    if (!rePassword) {
      newErrors.rePassword = "Vui lòng xác nhận mật khẩu mới";
      isValid = false;
    } else if (newPassword !== rePassword) {
      newErrors.rePassword = "Mật khẩu xác nhận không khớp";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;
    if (!user || !user.email) return;

    setIsLoading(true);
    try {
      // 1. Xác thực mật khẩu hiện tại (thử đăng nhập lại)
      try {
        await authService.login(user.email, currentPassword);
      } catch (loginError: any) {
        throw new Error("Mật khẩu hiện tại không chính xác");
      }

      // 2. Cập nhật mật khẩu mới
      await authService.updatePassword(newPassword);

      Toast.show({
        type: "success",
        text1: "Đổi mật khẩu thành công",
        text2: "Mật khẩu của bạn đã được cập nhật!",
      });

      // Quay lại ProfileScreen
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#181C2E" }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <BackButton style={styles.backButtonPosition} />
                <Text style={styles.title}>Đổi mật khẩu</Text>
                <Text style={styles.subtitle}>
                  Vui lòng nhập mật khẩu mới của bạn
                </Text>
              </View>

              <View style={styles.formContainer}>
                {/* MẬT KHẨU HIỆN TẠI */}
                <Text style={styles.label}>MẬT KHẨU HIỆN TẠI</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.currentPassword ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    placeholder="••••••••••••"
                    secureTextEntry={!showCurrentPassword}
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={(text) => {
                      setCurrentPassword(text);
                      setErrors({ ...errors, currentPassword: undefined });
                    }}
                    placeholderTextColor="#A0A5BA"
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Ionicons
                      name={showCurrentPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#A0A5BA"
                    />
                  </TouchableOpacity>
                </View>
                {errors.currentPassword && (
                  <Text style={styles.errorText}>{errors.currentPassword}</Text>
                )}

                {/* MẬT KHẨU MỚI */}
                <Text style={styles.label}>MẬT KHẨU MỚI</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    (errors.newPassword || (newPassword && currentPassword && newPassword === currentPassword)) ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    placeholder="••••••••••••"
                    secureTextEntry={!showNewPassword}
                    style={styles.input}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      setErrors({ ...errors, newPassword: undefined });
                    }}
                    placeholderTextColor="#A0A5BA"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#A0A5BA"
                    />
                  </TouchableOpacity>
                </View>
                {(errors.newPassword || (newPassword && currentPassword && newPassword === currentPassword)) ? (
                  <Text style={styles.errorText}>
                    {errors.newPassword || "Mật khẩu mới phải khác mật khẩu hiện tại"}
                  </Text>
                ) : null}

                {/* XÁC NHẬN MẬT KHẨU MỚI */}
                <Text style={styles.label}>NHẬP LẠI MẬT KHẨU MỚI</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    (errors.rePassword || (rePassword && newPassword && rePassword !== newPassword)) ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    placeholder="••••••••••••"
                    secureTextEntry={!showRePassword}
                    style={styles.input}
                    value={rePassword}
                    onChangeText={(text) => {
                      setRePassword(text);
                      setErrors({ ...errors, rePassword: undefined });
                    }}
                    placeholderTextColor="#A0A5BA"
                  />
                  <TouchableOpacity
                    onPress={() => setShowRePassword(!showRePassword)}
                  >
                    <Ionicons
                      name={showRePassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#A0A5BA"
                    />
                  </TouchableOpacity>
                </View>
                {(errors.rePassword || (rePassword && newPassword && rePassword !== newPassword)) ? (
                  <Text style={styles.errorText}>
                    {errors.rePassword || "Mật khẩu xác nhận không khớp"}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!currentPassword || !newPassword || !rePassword || newPassword === currentPassword || newPassword !== rePassword) ? styles.submitBtnDisabled : null
                  ]}
                  onPress={handleChangePassword}
                  disabled={isLoading || !currentPassword || !newPassword || !rePassword || newPassword === currentPassword || newPassword !== rePassword}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>LƯU MẬT KHẨU</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181C2E",
  },
  header: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    position: "relative",
  },
  backButtonPosition: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  title: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    color: "#fff",
    opacity: 0.8,
    fontSize: 15,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 10,
  },
  label: {
    fontSize: 13,
    color: "#32343E",
    marginBottom: 8,
    marginTop: 20,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5FA",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 56,
  },
  input: {
    flex: 1,
    color: "#32343E",
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: "#FF7622",
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  submitBtnDisabled: {
    backgroundColor: "#e0e0e0ff",
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#FF4B4B",
  },
  errorText: {
    color: "#FF4B4B",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
