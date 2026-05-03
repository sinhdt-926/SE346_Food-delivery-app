//Nơi chứa các màn hình chính của khách hàng sau khi đăng nhập thành công (Trang chủ, Danh mục, Giỏ hàng, Hồ sơ)
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/customer/HomeScreen";
import OrderScreen from "../screens/customer/OrderScreen";
import CartScreen from "../screens/customer/CartScreen";

const Tab = createBottomTabNavigator();

export default function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* Các tab khác thêm sau */}
      <Tab.Screen name="Orders" component={OrderScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
    </Tab.Navigator>
  );
}
