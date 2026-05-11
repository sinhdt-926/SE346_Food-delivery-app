import React from "react";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  title?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress?: () => void;
}

export default function TopTabButton({
  title,
  iconName,
  active = false,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.content}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={22}
            color={active ? "#FF7622" : "#B1B1B1"}
          />
        )}
        {title && (
          <Text
            style={[
              styles.text,
              active && styles.activeText,
              iconName && styles.textWithIcon,
            ]}
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
    minWidth: 60,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    fontSize: 15,
    fontWeight: "500",
    color: "#B1B1B1",
  },

  activeText: {
    color: "#FF7622",
    fontWeight: "700",
  },

  textWithIcon: {
    marginLeft: 6,
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
