import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { IconType } from "../types/icon";

interface Props {
  title?: string;
  iconName?: string;
  iconType?: IconType;
  active?: boolean;
  onPress?: () => void;
  buttonStyle?: StyleProp<ViewStyle>;
}

export default function TopTabButton({
  title,
  iconName,
  iconType,
  active = false,
  onPress,
  buttonStyle,
}: Props) {
  const iconColor = active ? "#FF7622" : "#B1B1B1";
  const renderIcon = () => {
    if (!iconName) return null;

    switch (iconType) {
      case "material":
        return (
          <MaterialCommunityIcons
            name={iconName as any}
            size={22}
            color={iconColor}
          />
        );

      case "feather":
        return <Feather name={iconName as any} size={22} color={iconColor} />;

      default:
        return <Ionicons name={iconName as any} size={22} color={iconColor} />;
    }
  };
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, buttonStyle]}
    >
      <View style={styles.content}>
        {renderIcon()}
        {title && (
          <Text
            numberOfLines={1}
            style={[styles.text, active && styles.activeText]}
          >
            {title}
          </Text>
        )}
      </View>
      {active && <View style={styles.line} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  content: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    marginTop: 2,
    fontSize: 7,
    fontWeight: "500",
    color: "#B1B1B1",
  },

  activeText: {
    color: "#FF7622",
    fontWeight: "700",
  },

  line: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 2.5,
    borderRadius: 999,
    backgroundColor: "#FF7622",
  },
});
