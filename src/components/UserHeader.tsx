import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface UserHeaderProps {
  name?: string;
  imageUrl?: string | null;
  showEditBadge?: boolean;
  onEditPress?: () => void;
}

export default function UserHeader({
  name,
  imageUrl,
  showEditBadge = false,
  onEditPress,
}: UserHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={50} color="#FFF" />
          </View>
        )}

        {showEditBadge && (
          <TouchableOpacity style={styles.editBadge} onPress={onEditPress}>
            <Ionicons name="camera" size={14} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.name}>{name || "Chưa cập nhật"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginVertical: 24 },
  avatarContainer: { position: "relative" },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFD4B8",
    justifyContent: "center",
    alignItems: "center",
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
