import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import BackButton from "../../components/BackButton";
import CustomButton from "../../components/CustomButton";
import { createFood, uploadImage } from "../../services/food.service";

const tags = ["Fastfood", "Dessert", "Drink"];

export default function AddEditFoodScreen() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState("Fastfood");
  const [isSaving, setIsSaving] = useState(false);

  //loại
  const categoryMap: Record<string, number> = {
    Fastfood: 1,
    Dessert: 2,
    Drink: 3,
  };

  // chọn ảnh
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission denied", "Please allow access to gallery");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // reset thông tin
  const handleReset = () => {
    setName("");
    setPrice("");
    setDetails("");
    setImage(null);
    setSelectedTag("Fastfood");
  };

  // save thông tin
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter food name");
      return;
    }

    if (!price.trim()) {
      Alert.alert("Missing Price", "Please enter price");
      return;
    }

    if (isNaN(Number(price))) {
      Alert.alert("Invalid Price", "Price must be number");
      return;
    }

    if (!image) {
      Alert.alert("Missing Image", "Please upload image");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(image);
      const blob = await response.blob();
      // upload image
      const imageUrl = await uploadImage(blob);
      // create food
      await createFood({
        name: name.trim(),
        price: Number(price),
        description: details.trim(),
        image_url: imageUrl,
        category_id: categoryMap[selectedTag],
      });
      Alert.alert("Success", "Food added successfully!");

      handleReset();
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Failed to add food");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/*header*/}
      <View style={styles.header}>
        <BackButton />

        <Text style={styles.headerTitle}>Add New Item</Text>

        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>RESET</Text>
        </TouchableOpacity>
      </View>

      {/*name*/}
      <View style={styles.section}>
        <Text style={styles.label}>FOOD NAME</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Dish name"
          placeholderTextColor="#A5A5A5"
          style={styles.input}
        />
      </View>

      {/*upload*/}
      <View style={styles.section}>
        <Text style={styles.label}>UPLOAD PHOTO</Text>

        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={styles.previewBox}
            activeOpacity={0.8}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.emptyUploadContainer}>
                <View style={styles.uploadIconWrapper}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={32}
                    color="#7C5CFC"
                  />
                </View>

                <Text style={styles.uploadText}>Upload Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/*price*/}
      <View style={styles.section}>
        <Text style={styles.label}>PRICE</Text>

        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="0"
          placeholderTextColor="#A5A5A5"
          keyboardType="numeric"
          style={[styles.input, styles.priceInput]}
        />
      </View>

      {/*tags*/}
      <View style={styles.section}>
        <Text style={styles.label}>TAGS</Text>
        <View style={styles.tagsContainer}>
          {tags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => setSelectedTag(tag)}
                style={[styles.tagButton, isSelected && styles.activeTagButton]}
              >
                <Text
                  style={[styles.tagText, isSelected && styles.activeTagText]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/*details*/}
      <View style={styles.section}>
        <Text style={styles.label}>DETAILS</Text>
        <TextInput
          value={details}
          onChangeText={setDetails}
          multiline
          placeholder="Description"
          placeholderTextColor="#A5A5A5"
          textAlignVertical="top"
          style={styles.detailsInput}
        />
      </View>

      {/*save button*/}
      <CustomButton
        title="SAVE CHANGES"
        onPress={handleSave}
        isLoading={isSaving}
        buttonStyle={styles.saveButton}
        textStyle={styles.saveButtonText}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#F8F8F8",
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },

  resetText: {
    fontSize: 13,
    color: "#FF6B1A",
    fontWeight: "600",
  },

  section: {
    marginBottom: 24,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    marginBottom: 12,
    letterSpacing: 1,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    color: "#222",
    fontSize: 14,
  },

  priceInput: {
    width: 120,
  },

  uploadContainer: {
    alignItems: "center",
  },

  previewBox: {
    width: 190,
    height: 190,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#DADADA",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  emptyUploadContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  uploadIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F2EEFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  uploadText: {
    color: "#999",
    fontSize: 15,
    fontWeight: "500",
  },

  tagsContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },

  tagButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#B8C1CC",
    backgroundColor: "#FFF",
  },

  activeTagButton: {
    backgroundColor: "#9EADBF",
    borderColor: "#9EADBF",
  },

  tagText: {
    color: "#222",
    fontSize: 13,
    fontWeight: "500",
  },

  activeTagText: {
    color: "#FFF",
  },

  detailsInput: {
    height: 120,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    backgroundColor: "#FFF",
    padding: 16,
    fontSize: 14,
    color: "#222",
  },

  saveButton: {
    marginTop: 40,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FF7A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});
