import React from "react";
import { Alert, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../services/auth.service";
import { Ionicons } from "@expo/vector-icons";

export default function LogoutButton() {
  const navigation = useNavigation<any>();
  const handleLogout = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      {
        text: "Cancel",

        style: "cancel",
      },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.signOut();
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "Login",
                },
              ],
            });
          } catch (error) {
            Alert.alert("Error", "Unable to log out");
          }
        },
      },
    ]);
  };
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.logoutButton}
      onPress={handleLogout}
    >
      <Ionicons name="log-out-outline" size={26} color="#FF7622" />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2C2F3E",
  },
});
