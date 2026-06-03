import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SectionCardProps {
  title?: string;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
}

export default function SectionCard({ title, rightElement, children }: SectionCardProps) {
  return (
    <View style={styles.sectionCard}>
      {(title || rightElement) && (
        <View style={styles.sectionRow}>
          {title && <Text style={styles.sectionTitle}>{title}</Text>}
          {rightElement}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#181C2E",
  },
});
