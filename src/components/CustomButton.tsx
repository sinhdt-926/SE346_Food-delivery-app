import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { IconType } from "../types/icon";

interface CustomButtonProps extends TouchableOpacityProps {
  title?: string;
  isLoading?: boolean;
  // Cho phép truyền style custom từ bên ngoài vào
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconName?: string;
  iconType?: IconType;
  iconColor?: string;
}

export default function CustomButton({
  title,
  isLoading = false,
  buttonStyle,
  textStyle,
  iconName,
  iconType = "ion",
  iconColor = "white",
  ...props
}: CustomButtonProps) {
  const renderIcon = () => {
    if (!iconName) return null;

    switch (iconType) {
      case "material":
        return (
          <MaterialCommunityIcons
            name={iconName as any}
            size={20}
            color={iconColor}
          />
        );

      case "feather":
        return <Feather name={iconName as any} size={20} color={iconColor} />;

      default:
        return <Ionicons name={iconName as any} size={20} color={iconColor} />;
    }
  };
  return (
    <TouchableOpacity
      {...props}
      disabled={isLoading || props.disabled}
      activeOpacity={0.8}
      // Nối mảng style: Style mặc định đứng trước, style custom đứng sau để ghi đè
      style={[
        styles.defaultButton,
        props.disabled && styles.disabledButton,
        buttonStyle,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <View style={styles.content}>
          {renderIcon()}

          <Text style={[styles.defaultText, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  defaultButton: {
    backgroundColor: "#FF7622",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingVertical: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  defaultText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
