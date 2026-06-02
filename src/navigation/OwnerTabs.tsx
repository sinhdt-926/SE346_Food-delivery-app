import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ManagerOrdersScreen from "../screens/owner/ManageOrdersScreen";
import ManagerMenuScreen from "../screens/owner/ManageMenuScreen";
import DashboardScreen from "../screens/owner/DashboardScreen";
import ManagerPromosScreen from "../screens/owner/ManagePromosScreen";
import { TabIcon } from "../components/TabIcon";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function CustomerTabs() {
  console.log("OWNER TABS");
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          height: 90,
          paddingTop: 5,
          paddingBottom: 10,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 10,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: "absolute",
        },
      }}
    >
      {/* tab dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home-outline" title="Trang chủ" focused={focused} />
          ),
        }}
      />
      {/* tab manager menu */}
      <Tab.Screen
        name="Menu"
        component={ManagerMenuScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="grid-outline" title="Danh mục" focused={focused} />
          ),
        }}
      />

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
      {/* tab managerorder */}
      <Tab.Screen
        name="Orders"
        component={ManagerOrdersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="clipboard-outline"
              title="Đơn hàng"
              focused={focused}
            />
          ),
        }}
      />
      {/* tab profile */}
      <Tab.Screen
        name="Promos"
        component={ManagerPromosScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="gift-outline" title="Khuyến mãi" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
