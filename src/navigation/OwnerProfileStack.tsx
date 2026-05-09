import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OwnerProfileScreen from "../screens/owner/OwnerProfileScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileScreen" component={OwnerProfileScreen} />
    </Stack.Navigator>
  );
}
