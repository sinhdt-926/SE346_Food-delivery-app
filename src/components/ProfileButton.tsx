import React from "react";

import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface ProfileButtonProps extends TouchableOpacityProps {
  title: string;

  iconName: keyof typeof Ionicons.glyphMap;

  iconColor: string;

  rightText?: string;
}

export default function ProfileButton({
  title,
  iconName,
  iconColor,
  rightText,
  ...props
}: ProfileButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.container} {...props}>
      {/* LEFT */}
      <View style={styles.leftContent}>
        <View style={styles.iconWrapper}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>

        <Text style={styles.title}>{title}</Text>
      </View>

      {/* RIGHT */}
      <View style={styles.rightContent}>
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}

        <Ionicons name="chevron-forward" size={20} color="#A5A5A5" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: 18,

    paddingVertical: 18,
  },

  leftContent: {
    flexDirection: "row",

    alignItems: "center",
  },

  iconWrapper: {
    width: 52,
    height: 52,

    borderRadius: 26,

    backgroundColor: "#FFF",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 16,
  },

  title: {
    fontSize: 16,

    fontWeight: "500",

    color: "#222",
  },

  rightContent: {
    flexDirection: "row",

    alignItems: "center",
  },

  rightText: {
    marginRight: 10,

    fontSize: 16,

    fontWeight: "600",

    color: "#A5A5A5",
  },
});
