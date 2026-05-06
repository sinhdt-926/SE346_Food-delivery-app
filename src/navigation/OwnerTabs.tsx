import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import OwnerProfileScreen from "../screens/owner/OwnerProfileScreen";

const Tab = createBottomTabNavigator();

export default function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          height: 80,
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 10,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: "absolute",
        },
      }}
    >
      {/* Nut add new food */}
      <Tab.Screen
        name="AddButton"
        component={View}
        options={{
          tabBarIcon: () => (
            <View
              style={{
                width: 65,
                height: 65,
                borderRadius: 999,
                backgroundColor: "#FFF",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 30,
                borderWidth: 2,
                borderColor: "#FF7A1A",
              }}
            >
              <Ionicons name="add" size={32} color="#FF7A1A" />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent()?.navigate("AddEditFood" as never);
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={OwnerProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person-outline"
              size={28}
              color={focused ? "#FF7A1A" : "#999"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
