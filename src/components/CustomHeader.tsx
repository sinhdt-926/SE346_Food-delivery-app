import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
}

export default function CustomHeader({
  title,
  showBackButton = true,
  rightActionLabel,
  onRightActionPress,
}: CustomHeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Slot Trái (Nút Back) */}
      <View style={styles.sideSlot}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={24} color="#1E1E1E" />
          </TouchableOpacity>
        )}
      </View>

      {/* Slot Giữa (Tiêu đề) */}
      <View style={styles.centerSlot}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Slot Phải (Nút Edit/Save) */}
      <View style={[styles.sideSlot, { alignItems: "flex-end" }]}>
        {rightActionLabel && onRightActionPress && (
          <TouchableOpacity
            onPress={onRightActionPress}
            style={styles.textButton}
          >
            <Text style={styles.rightLabel}>{rightActionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  sideSlot: {
    flex: 1, // Hai bên chiếm 1 phần
    justifyContent: "center",
  },
  centerSlot: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  textButton: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  title: { fontSize: 17, fontWeight: "600", color: "#1E1E1E" },
  rightLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF8A00",
    textTransform: "uppercase",
  },
});
