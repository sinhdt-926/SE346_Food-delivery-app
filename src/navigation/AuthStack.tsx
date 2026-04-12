//Nơi chứa Stack Navigator cho các màn hình liên quan đến xác thực (Đăng nhập, Đăng ký, Quên mật khẩu, Xác thực OTP, Cập nhật mật khẩu mới)
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types/app";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotScreen from "../screens/auth/ForgotScreen";
import VertificationScreen from "../screens/auth/VertificationScreen";
import NewPasswordScreen from "../screens/auth/NewPasswordScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Forgot" component={ForgotScreen} />
      <Stack.Screen name="Verification" component={VertificationScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
    </Stack.Navigator>
  );
}
