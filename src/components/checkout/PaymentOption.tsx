import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PaymentOptionProps {
  label: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onPress: () => void;
}

export default function PaymentOption({
  label,
  description,
  iconName,
  isSelected,
  onPress,
}: PaymentOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.paymentOption, isSelected && styles.paymentOptionSelected]}
      onPress={onPress}
    >
      <View style={styles.paymentIconBox}>
        <Ionicons
          name={iconName}
          size={24}
          color={isSelected ? "#FF7622" : "#6E7078"}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.paymentLabel, isSelected && styles.paymentLabelSelected]}
        >
          {label}
        </Text>
        <Text style={styles.paymentDesc}>{description}</Text>
      </View>
      <View
        style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
      >
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#E8EBF0",
    borderRadius: 14,
    padding: 14,
  },
  paymentOptionSelected: {
    borderColor: "#FF7622",
    backgroundColor: "#FFF8F3",
  },
  paymentIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#32343E",
  },
  paymentLabelSelected: {
    color: "#FF7622",
  },
  paymentDesc: {
    fontSize: 12,
    color: "#A0A5BA",
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D0D5E0",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#FF7622",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF7622",
  },
});
