import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import FormInput from "../../components/FormInput";
import UserHeader from "../../components/UserHeader";
import { useAuthStore } from "../../store/useAuthStore";

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: user?.user_metadata.full_name || "Vishal Khadok",
    email: user?.email || "hello@halallab.co",
    phone: user?.user_metadata.phone || "408-841-0926",
    bio: "I love fast food",
  });

  const handleSave = () => {
    updateProfile(formData);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Edit Profile" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Bật cờ showEditBadge = true */}
        <UserHeader
          name={user?.user_metadata?.full_name}
          bio={user?.user_metadata?.bio}
          showEditBadge={true}
        />

        <FormInput
          label="FULL NAME"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          style={styles.customInput} // Tùy chỉnh input xám
        />

        <FormInput
          label="EMAIL"
          value={formData.email}
          keyboardType="email-address"
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          style={styles.customInput}
        />

        <FormInput
          label="PHONE NUMBER"
          value={formData.phone}
          keyboardType="phone-pad"
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          style={styles.customInput}
        />

        <FormInput
          label="BIO"
          value={formData.bio}
          multiline
          onChangeText={(text) => setFormData({ ...formData, bio: text })}
          style={[styles.customInput, { height: 80, textAlignVertical: "top" }]}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>SAVE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 20 },
  customInput: {
    backgroundColor: "#F3F4F8",
    borderWidth: 0,
    borderRadius: 10,
  },
  footer: { padding: 20 },
  saveButton: {
    backgroundColor: "#FF8A00",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
