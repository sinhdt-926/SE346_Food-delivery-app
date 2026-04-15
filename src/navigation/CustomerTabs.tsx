//Nơi chứa các màn hình chính của khách hàng sau khi đăng nhập thành công (Trang chủ, Danh mục, Giỏ hàng, Hồ sơ)
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/customer/HomeScreen";

const Tab = createBottomTabNavigator();

export default function CustomerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* Các tab khác thêm sau */}
    </Tab.Navigator>
  );
}
