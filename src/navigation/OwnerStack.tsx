import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { subscribeToNewGlobalOrders } from "../services/order.service";

import OwnerTabs from "./OwnerTabs";
import AddEditFoodScreen from "../screens/owner/AddEditFoodScreen";
import ManagerOrdersScreen from "../screens/owner/ManageOrdersScreen";
import OrderDetailScreen from "../screens/owner/OrderDetailScreen";
import ManagerMenuScreen from "../screens/owner/ManageMenuScreen";
import DashboardScreen from "../screens/owner/DashboardScreen";
import AddEditPromotionScreen from "../screens/owner/PromoDetailScreen";
import PopularItemsScreen from "../screens/owner/PopularItemsScreen";
import RevenusMonthScreen from "../screens/owner/RevenusMonthScreen";

const Stack = createNativeStackNavigator();

export default function OwnerStack() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Gọi hàm Service để lắng nghe (UI giờ đây "Sạch" hoàn toàn, không liên quan Database)
    const unsubscribe = subscribeToNewGlobalOrders((payload) => {
      Toast.show({
        type: "info",
        text1: "🔔 Có Đơn Hàng Mới!",
        text2: "Bạn vừa nhận được một đơn đặt hàng mới. Chạm để xem.",
        position: "top",
        visibilityTime: 4000,
        onPress: () => {
          Toast.hide();
          navigation.navigate("ManagerOrders");
        },
      });
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OwnerTabs" component={OwnerTabs} />

      {/* Add Food */}
      <Stack.Screen name="AddEditFood" component={AddEditFoodScreen} />

      {/* Manager Orders */}
      <Stack.Screen name="ManagerOrders" component={ManagerOrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />

      {/* Manager Menu */}
      <Stack.Screen name="ManagerMenu" component={ManagerMenuScreen} />
      {/* Dashboard */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen
        name="AddEditPromotion"
        component={AddEditPromotionScreen}
      />
      {/* PopularItems */}
      <Stack.Screen name="PopularItems" component={PopularItemsScreen} />
      {/* Revenus Month */}
      <Stack.Screen name="RevenusMonth" component={RevenusMonthScreen} />
    </Stack.Navigator>
  );
}