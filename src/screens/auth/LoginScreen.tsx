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
import Checkbox from "expo-checkbox";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types/app";
import { authService } from "../../services/auth.service";
import Toast from "react-native-toast-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
>;

const LoginScreen = ({
  navigation,
}: {
  navigation: LoginScreenNavigationProp;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  // Kiểm tra tính hợp lệ của email và mật khẩu trước khi gọi API
  const validate = () => {
    let isValid = true;
    let newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "Please enter your email";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Please enter your password";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Xử lý gửi yêu cầu đăng nhập và hiển thị thông báo kết quả
  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.login(email, password);

      // Hiển thị thông báo thành công
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Welcome back! 👋",
      });
    } catch (error: any) {
      // Hiển thị thông báo lỗi từ server
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Invalid email or password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#181C2E" }}
      edges={["top", "left", "right"]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Log In</Text>
              <Text style={styles.subtitle}>
                Please sign in to your existing account
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>EMAIL</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.email ? styles.inputError : null,
                ]}
              >
                <TextInput
                  placeholder="example@gmail.com"
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#A0A5BA"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <Text style={styles.label}>PASSWORD</Text>
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
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#A0A5BA"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <View style={styles.row}>
                <View style={styles.checkboxRow}>
                  <Checkbox
                    value={remember}
                    onValueChange={setRemember}
                    style={styles.checkbox}
                  />
                  <Text style={styles.rememberText}>Remember me</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Forgot")}>
                  <Text style={styles.forgotText}>Forgot Password</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginBtnText}>LOG IN</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={styles.signUpText}>SIGN UP</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.orText}>Or</Text>

              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={[styles.socialIcon, { backgroundColor: "#3B5998" }]}
                >
                  <Ionicons name="logo-facebook" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialIcon, { backgroundColor: "#1DA1F2" }]}
                >
                  <Ionicons name="logo-twitter" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialIcon, { backgroundColor: "#181C2E" }]}
                >
                  <Ionicons name="logo-apple" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181C2E",
    fontFamily: "Segoe UI",
  },

  header: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
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
  },

  label: {
    fontSize: 13,
    color: "#32343E",
    marginBottom: 8,
    marginTop: 20,
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
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    marginRight: 8,
  },

  rememberText: {
    color: "#7E8389",
  },

  forgotText: { color: "#FF7622", fontWeight: "500" },
  loginBtn: {
    backgroundColor: "#FF7622",
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },

  loginBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  footerText: {
    color: "#646982",
  },

  signUpText: {
    color: "#FF7622",
    fontWeight: "bold",
  },

  orText: {
    textAlign: "center",
    color: "#646982",
    marginVertical: 20,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },

  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
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

export default LoginScreen;
