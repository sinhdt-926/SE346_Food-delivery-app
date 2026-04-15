import React, { useState, useRef } from "react";
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
import { RouteProp, useRoute } from "@react-navigation/native";
import { AuthStackParamList } from "../../types/app";
import BackButton from "../../components/BackButton";
import { authService } from "../../services/auth.service";
import Toast from "react-native-toast-message";

type VerificationScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Verification"
>;
type VerificationScreenRouteProp = RouteProp<
  AuthStackParamList,
  "Verification"
>;

interface Props {
  navigation: VerificationScreenNavigationProp;
}

const VerificationScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<VerificationScreenRouteProp>();
  const { email, fromScreen } = route.params;

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tự động chuyển sang ô tiếp theo khi người dùng nhập số
  const handleChangeText = (text: string, index: number) => {
    setError(null);
    const value = text.replace(/[^0-9]/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Xử lý lùi ô tiêu điểm khi người dùng nhấn Backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Gọi API xác thực mã OTP gửi về email
  const handleVerify = async () => {
    const finalCode = code.join("");
    if (finalCode.length < 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      if (fromScreen === "Register") {
        await authService.verifyOtp(email, finalCode, "signup");
        Toast.show({
          type: "success",
          text1: "Authentication successful 🎉",
          text2: "Your account has been activated! You can now log in.",
        });
        navigation.navigate("Login");
      } else if (fromScreen === "Forgot") {
        await authService.verifyOtp(email, finalCode, "recovery");
        navigation.navigate("NewPassword");
      }
    } catch (error: any) {
      setError("Invalid or expired verification code");
      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2: "Please check your OTP code.",
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
                <Text style={styles.title}>Verification</Text>
                <Text style={styles.subtitle}>
                  We have sent a code to your email
                </Text>
                <Text style={styles.emailText}>{email}</Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.codeHeaderRow}>
                  <Text style={styles.label}>CODE</Text>
                  <View style={styles.resendContainer}>
                    <TouchableOpacity>
                      <Text style={styles.resendText}>Resend</Text>
                    </TouchableOpacity>
                    <Text style={styles.timerText}> in</Text>
                  </View>
                </View>

                <View style={styles.otpContainer}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        digit ? styles.otpInputFilled : null,
                        error ? styles.inputError : null,
                      ]}
                      value={digit}
                      onChangeText={(text) => handleChangeText(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      textAlign="center"
                    />
                  ))}
                </View>

                {error && (
                  <Text
                    style={[
                      styles.errorText,
                      { marginBottom: 20, textAlign: "center" },
                    ]}
                  >
                    {error}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleVerify}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>VERIFY</Text>
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
    height: 250,
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

  emailText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 5,
  },

  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 30,
  },

  codeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    color: "#32343E",
    fontWeight: "600",
  },

  resendContainer: {
    flexDirection: "row",
  },

  resendText: {
    color: "#32343E",
    textDecorationLine: "underline",
    fontWeight: "600",
  },

  timerText: {
    color: "#A0A5BA",
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 8,
  },

  otpInput: {
    width: 48,
    height: 60,
    backgroundColor: "#F0F5FA",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "bold",
    color: "#32343E",
    borderWidth: 1,
    borderColor: "transparent",
  },

  otpInputFilled: {
    borderColor: "#FF7622",
    backgroundColor: "#fff",
  },

  submitBtn: {
    backgroundColor: "#FF7622",
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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

export default VerificationScreen;
