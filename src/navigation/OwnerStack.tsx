import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OwnerTabs from "./OwnerTabs";
import AddEditFoodScreen from "../screens/owner/AddEditFoodScreen";
import ManagerOrdersScreen from "../screens/owner/ManageOrdersScreen";
import OrderDetailScreen from "../screens/owner/OrderDetailScreen";

const Stack = createNativeStackNavigator();

export default function OwnerStack() {
  console.log("OWNER STACK");
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OwnerTabs" component={OwnerTabs} />

      {/* Add Food */}
      {/* <Stack.Screen name="AddEditFood" component={AddEditFoodScreen} /> */}

      {/* Manager Orders */}
      <Stack.Screen name="ManagerOrders" component={ManagerOrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
}
