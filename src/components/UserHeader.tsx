import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface UserHeaderProps {
  name?: string;
  bio?: string;
  showEditBadge?: boolean;
}

export default function UserHeader({
  name,
  bio,
  showEditBadge = false,
}: UserHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {/* Ảnh giả lập theo thiết kế */}
        <View style={styles.avatarPlaceholder} />

        {/* Nút bút chì Edit (Chỉ hiện ở màn hình Edit Profile) */}
        {showEditBadge && (
          <TouchableOpacity style={styles.editBadge}>
            <Ionicons name="pencil" size={12} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.name}>{name || "Chưa cập nhật"}</Text>
      <Text style={styles.bio}>{bio || "Chưa có tiểu sử"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginVertical: 24 },
  avatarContainer: { position: "relative" },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFD4B8",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF8A00",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  name: { fontSize: 20, fontWeight: "bold", color: "#1E1E1E", marginTop: 16 },
  bio: { fontSize: 14, color: "#A0A5BA", marginTop: 4 },
});
