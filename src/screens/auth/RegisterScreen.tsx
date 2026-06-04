import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthStackParamList } from "../../types/app";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import BackButton from "../../components/BackButton";
import { authService } from "../../services/auth.service";
import Toast from "react-native-toast-message";
type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Register"
>;

const RegisterScreen = ({
  navigation,
}: {
  navigation: RegisterScreenNavigationProp;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Validate form trước khi gọi API đăng ký
  const validate = () => {
    let isValid = true;
    let newErrors: any = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập tên";
      isValid = false;
    }

    if (!email) {
      newErrors.email = "Vui lòng nhập email";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Vui lòng nhập đúng định dạng email";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    if (!rePassword) {
      newErrors.rePassword = "Vui lòng xác nhận mật khẩu";
      isValid = false;
    } else if (password !== rePassword) {
      newErrors.rePassword = "Mật khẩu không khớp";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Xử lý gọi API đăng ký và hiển thị thông báo
  const handleSignUp = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.signUp(email, password, name);

      // Hiển thị thông báo thành công
      Toast.show({
        type: "success",
        text1: "Thành công!",
        text2: "Vui lòng kiểm tra email để lấy mã xác minh.",
      });

      navigation.navigate("Verification", {
        email: email,
        fromScreen: "Register",
      });
    } catch (error: any) {
      // Hiển thị thông báo lỗi
      Toast.show({
        type: "error",
        text1: "Lỗi đăng ký",
        text2: error.message,
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
              <BackButton style={styles.backButtonPosition} />
              <Text style={styles.title}>Đăng Ký</Text>
              <Text style={styles.subtitle}>Vui lòng đăng ký để bắt đầu</Text>
            </View>

            <View style={styles.formContainer}>
              {/* INPUT TÊN */}
              <Text style={styles.label}>Tên của bạn</Text>
              <View
                style={[styles.inputWrapper, errors.name && styles.inputError]}
              >
                <TextInput
                  placeholder="John doe"
                  style={styles.input}
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    setErrors({ ...errors, name: null });
                  }}
                  autoCapitalize="words"
                  placeholderTextColor="#A0A5BA"
                />
              </View>
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              {/* INPUT EMAIL */}
              <Text style={styles.label}>Email</Text>
              <View
                style={[styles.inputWrapper, errors.email && styles.inputError]}
              >
                <TextInput
                  placeholder="example@gmail.com"
                  style={styles.input}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setErrors({ ...errors, email: null });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#A0A5BA"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {/* INPUT MẬT KHẨU */}
              <Text style={styles.label}>Mật khẩu</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password && styles.inputError,
                ]}
              >
                <TextInput
                  placeholder="••••••••••••"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setErrors({ ...errors, password: null });
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

              {/* NHẬP LẠI MẬT KHẨU */}
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.rePassword && styles.inputError,
                ]}
              >
                <TextInput
                  placeholder="••••••••••••"
                  secureTextEntry={!showRePassword}
                  style={styles.input}
                  value={rePassword}
                  onChangeText={(t) => {
                    setRePassword(t);
                    setErrors({ ...errors, rePassword: null });
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
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>ĐĂNG KÝ</Text>
                )}
              </TouchableOpacity>
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

export default RegisterScreen;
