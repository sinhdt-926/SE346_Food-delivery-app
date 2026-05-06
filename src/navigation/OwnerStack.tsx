import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OwnerTabs from "./OwnerTabs";
import AddEditFoodScreen from "../screens/owner/AddEditFoodScreen";

const Stack = createNativeStackNavigator();

export default function OwnerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Tabs */}
      <Stack.Screen name="OwnerTabs" component={OwnerTabs} />

      {/* Add Food */}
      <Stack.Screen name="AddEditFood" component={AddEditFoodScreen} />
    </Stack.Navigator>
  );
}
