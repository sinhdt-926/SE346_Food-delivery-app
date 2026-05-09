import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  iconName: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress?: () => void;
}

export default function TopTabButton({ iconName, active, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <Ionicons
        name={iconName}
        size={24}
        color={active ? "#FF7622" : "#B1B1B1"}
      />
      {active && <View style={styles.line} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
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
