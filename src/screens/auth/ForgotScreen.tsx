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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types/app";
import BackButton from "../../components/BackButton";
import { authService } from "../../services/auth.service";
import Toast from "react-native-toast-message";

type ForgotScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Forgot"
>;

const ForgotScreen = ({
  navigation,
}: {
  navigation: ForgotScreenNavigationProp;
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra định dạng email và dữ liệu trống trước khi gửi yêu cầu
  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError("Please enter your email");
      return false;
    }
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  // Xử lý gửi mã OTP khôi phục mật khẩu tới email người dùng
  const handleSendCode = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(email);

      // Hiển thị thông báo thành công dạng trượt
      Toast.show({
        type: "success",
        text1: "Code sent",
        text2: "Please check your inbox.",
      });

      navigation.navigate("Verification", {
        email: email,
        fromScreen: "Forgot",
      });
    } catch (error: any) {
      // Hiển thị thông báo lỗi nếu API gặp vấn đề
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
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                  Please sign in to your existing account
                </Text>
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.label}>EMAIL</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    error ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    placeholder="example@gmail.com"
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#A0A5BA"
                  />
                </View>
                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSendCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>SEND CODE</Text>
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
    marginTop: 30,
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

export default ForgotScreen;
