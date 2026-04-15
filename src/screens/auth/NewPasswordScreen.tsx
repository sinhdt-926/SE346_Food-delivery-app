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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types/app";
import BackButton from "../../components/BackButton";
import { authService } from "../../services/auth.service";
import Toast from "react-native-toast-message";

type NewPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "NewPassword"
>;

interface Props {
  navigation: NewPasswordScreenNavigationProp;
}

const NewPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    rePassword?: string;
  }>({});

  // Kiểm tra dữ liệu đầu vào: mật khẩu trống, độ dài tối thiểu và khớp mật khẩu
  const validate = () => {
    let isValid = true;
    let newErrors: { password?: string; rePassword?: string } = {};

    if (!password) {
      newErrors.password = "Please enter a password";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!rePassword) {
      newErrors.rePassword = "Please confirm your password";
      isValid = false;
    } else if (password !== rePassword) {
      newErrors.rePassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Gửi yêu cầu cập nhật mật khẩu mới và hiển thị thông báo kết quả
  const handleSavePassword = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.updatePassword(password);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Your password has been changed!",
      });

      navigation.navigate("Login");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
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
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <BackButton style={styles.backButtonPosition} />
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Please enter your new password
                </Text>
              </View>

              <View style={styles.formContainer}>
                {/* NHẬP MẬT KHẨU MỚI */}
                <Text style={styles.label}>NEW PASSWORD</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.password ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    placeholder="••••••••••••"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors({ ...errors, password: undefined });
                    }}
                    placeholderTextColor="#A0A5BA"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#A0A5BA"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {/* XÁC NHẬN LẠI MẬT KHẨU */}
                <Text style={styles.label}>RE-TYPE PASSWORD</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.rePassword ? styles.inputError : null,
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
                {errors.rePassword && (
                  <Text style={styles.errorText}>{errors.rePassword}</Text>
                )}

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSavePassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>SAVE</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181C2E",
  },

  header: {
    height: 220,
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
    fontSize: 16,
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

export default NewPasswordScreen;
