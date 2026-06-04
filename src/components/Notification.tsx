import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ToastConfig } from "react-native-toast-message";

const CustomToast = ({ text1, text2, type, props }: any) => {
  const isSuccess = type === "success";
  const iconName = isSuccess ? "checkmark-circle" : "alert-circle";
  const iconColor = isSuccess ? "#4CAF50" : "#FF4B4B";

  return (
    <View style={styles.toastContainer}>
      <Ionicons
        name={iconName}
        size={28}
        color={iconColor}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        {text1 ? <Text style={styles.title}>{text1}</Text> : null}
        {props?.highlight ? (
          <Text style={styles.description}>
            {props.prefix}
            <Text style={{ fontWeight: "900", color: "#000000ff" }}>
              {props.highlight}
            </Text>
            {props.suffix}
          </Text>
        ) : text2 ? (
          <Text style={styles.description}>{text2}</Text>
        ) : null}
      </View>
    </View>
  );
};

export const toastConfig: ToastConfig = {
  success: (props) => <CustomToast {...props} type="success" />,
  error: (props) => <CustomToast {...props} type="error" />,
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    width: "90%",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,

    // ĐỔ BÓNG CHO ANDROID
    elevation: 10,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#32343E",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#646982be",
  },
});
