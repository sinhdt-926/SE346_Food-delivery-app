import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeScreen from "../screens/customer/HomeScreen";
import OrderScreen from "../screens/customer/OrderScreen";
import CartScreen from "../screens/customer/CartScreen";
import ProfileScreen from "../screens/customer/ProfileScreen";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { getMyOrders, subscribeToUserOrders } from "../services/order.service";
import { useState, useEffect } from "react";

const Tab = createBottomTabNavigator();

export default function CustomerTabs() {
  const insets = useSafeAreaInsets();
  const { items } = useCartStore();
  const { user } = useAuthStore();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const [activeOrderCount, setActiveOrderCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchActiveOrders = async () => {
      try {
        const orders = await getMyOrders();
        const activeCount = orders.filter(
          (o: any) =>
            o.status === "pending" ||
            o.status === "preparing" ||
            o.status === "delivering"
        ).length;
        setActiveOrderCount(activeCount);
      } catch (error) {
        console.error("Failed to fetch orders for badge:", error);
      }
    };

    fetchActiveOrders();
    const unsubscribe = subscribeToUserOrders(user.id, () => {
      fetchActiveOrders();
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#FF8A00",
        tabBarInactiveTintColor: "#828282",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Orders") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "Cart") {
            iconName = focused ? "cart" : "cart-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Trang chủ" }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderScreen}
        options={{
          tabBarLabel: "Đơn hàng",
          tabBarBadge: activeOrderCount > 0 ? activeOrderCount : undefined,
          tabBarBadgeStyle: { backgroundColor: "red", color: "white", fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: "Giỏ hàng",
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
          tabBarBadgeStyle: { backgroundColor: "red", color: "white", fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Hồ sơ" }}
      />
    </Tab.Navigator>
  );
}
