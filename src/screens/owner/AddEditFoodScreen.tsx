import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import BackButton from "../../components/BackButton";
import CustomButton from "../../components/CustomButton";
import {
  createFood,
  updateFood,
  uploadImage,
  deleteFood,
  getCategories,
  createCategory,
} from "../../services/food.service";
import { food, Category } from "../../types/cart";

export default function AddEditFoodScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingFood: food | undefined = route.params?.food;
  const isEditMode = useMemo(() => {
    return !!editingFood;
  }, [editingFood]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const allowExitRef = useRef(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  useEffect(() => {
    if (!editingFood) return;
    setName(editingFood.name);
    setPrice(String(editingFood.price));
    setDetails(editingFood.description ?? "");
    setImage(editingFood.image_url ?? null);
    setSelectedCategoryId(editingFood.category_id ?? 1);
    setIsAvailable(editingFood.is_available ?? true);
  }, [editingFood]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        // default category
        if (data.length > 0 && !editingFood) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Unable to load menu. Please try again.");
      }
    };
    fetchCategories();
  }, []);
  const hasChanges = useMemo(() => {
    if (!editingFood) {
      return (
        name.trim() !== "" ||
        price.trim() !== "" ||
        details.trim() !== "" ||
        image !== null ||
        selectedCategoryId !== categories[0]?.id ||
        isAvailable !== true
      );
    }
    return (
      name !== editingFood.name ||
      price !== String(editingFood.price) ||
      details !== (editingFood.description ?? "") ||
      image !== editingFood.image_url ||
      selectedCategoryId !== editingFood.category_id ||
      isAvailable !== (editingFood.is_available ?? true)
    );
  }, [
    name,
    price,
    details,
    image,
    selectedCategoryId,
    isAvailable,
    editingFood,
    categories,
  ]);
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (allowExitRef.current || !hasChanges || isSaving) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Save before leaving?",
        [
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              allowExitRef.current = true;
              navigation.goBack();
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Save",
            onPress: async () => {
              const success = await handleSave();
              if (success) {
                allowExitRef.current = true;
                navigation.goBack();
              }
            },
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation, hasChanges, isSaving]);
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission denied", "Please allow access to gallery");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Cannot pick image");
    }
  };
  const handleReset = () => {
    // edit
    if (editingFood) {
      setName(editingFood.name);
      setPrice(String(editingFood.price));
      setDetails(editingFood.description ?? "");
      setImage(editingFood.image_url ?? null);
      setSelectedCategoryId(editingFood.category_id ?? 1);
      setIsAvailable(editingFood.is_available ?? true);
      return;
    }

    // add
    setName("");
    setPrice("");
    setDetails("");
    setImage(null);
    setSelectedCategoryId(categories[0]?.id ?? 1);
    setIsAvailable(true);
  };
  const confirmReset = () => {
    Alert.alert("Confirm Reset", "Do you want to reset?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reset",
        onPress: async () => {
          handleReset();
        },
      },
    ]);
  };
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter food name");
      return false;
    }
    if (!price.trim()) {
      Alert.alert("Missing Price", "Please enter price");
      return false;
    }
    if (isNaN(Number(price))) {
      Alert.alert("Invalid Price", "Price must be a number");
      return false;
    }
    return true;
  };
  const handleSave = async (): Promise<boolean> => {
    if (!validateForm()) return false;
    try {
      setIsSaving(true);
      let imageUrl = image;
      if (image && image.startsWith("file")) {
        const response = await fetch(image);
        const blob = await response.blob();
        imageUrl = await uploadImage(blob);
      }
      const payload = {
        name: name.trim(),
        price: Number(price),
        description: details.trim(),
        image_url: imageUrl ?? undefined,
        category_id: selectedCategoryId,
        is_available: isAvailable,
      };
      if (isEditMode && editingFood) {
        await updateFood(Number(editingFood.id), payload);
      } else {
        await createFood(payload);
      }
      Alert.alert(
        "Success",
        isEditMode ? "Food updated successfully!" : "Food added successfully!",
      );
      return true;
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        isEditMode ? "Failed to update food" : "Failed to add food",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  const confirmSave = () => {
    Alert.alert(
      "Confirm Save",
      isEditMode
        ? "Do you want to save these changes?"
        : "Do you want to add this food?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save",
          onPress: async () => {
            const success = await handleSave();
            if (success) {
              allowExitRef.current = true;
              navigation.goBack();
            }
          },
        },
      ],
    );
  };
  const handleDelete = async () => {
    try {
      setIsSaving(true);
      await deleteFood(Number(editingFood!.id));
      Alert.alert("Success", "Food deleted successfully");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to delete food");
    } finally {
      setIsSaving(false);
    }
  };
  const confirmDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this food?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await handleDelete();
          },
        },
      ],
    );
  };
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Please enter the category name");
      return;
    }
    try {
      const newCategory = await createCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, newCategory]);
      setSelectedCategoryId(newCategory.id);
      setNewCategoryName("");
      setShowCategoryModal(false);
      Alert.alert("Success", "Category added");
    } catch (error) {
      Alert.alert("Error", "Unable to create category");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex}>
        {/* header */}
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Food" : "Add New Food"}
          </Text>
          <TouchableOpacity activeOpacity={0.8} onPress={confirmReset}>
            <Text style={styles.resetText}>RESET</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* name */}
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
          {/* image */}
          <View style={styles.section}>
            <Text style={styles.label}>UPLOAD PHOTO</Text>
            <View style={styles.uploadContainer}>
              <TouchableOpacity
                style={styles.previewBox}
                activeOpacity={0.85}
                onPress={pickImage}
              >
                {image ? (
                  <Image
                    source={{
                      uri: image,
                    }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.emptyUploadContainer}>
                    <View style={styles.uploadIconWrapper}>
                      <Ionicons
                        name="cloud-upload-outline"
                        size={34}
                        color="#FF7A1A"
                      />
                    </View>
                    <Text style={styles.uploadText}>Upload Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {/* price */}
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
          {/* status */}
          <View style={styles.section}>
            <Text style={styles.label}>STATUS</Text>
            <View style={styles.statusContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsAvailable(true)}
                style={[
                  styles.statusButton,
                  isAvailable && styles.activeAvailableButton,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isAvailable && styles.activeStatusText,
                  ]}
                >
                  Selling
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsAvailable(false)}
                style={[
                  styles.statusButton,
                  !isAvailable && styles.activeUnavailableButton,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    !isAvailable && styles.activeStatusText,
                  ]}
                >
                  Closed
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* category */}
          <View style={styles.section}>
            <Text style={styles.label}>CATEGORY</Text>
            <View style={styles.tagsContainer}>
              {categories.map((category) => {
                const isSelected = selectedCategoryId === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    activeOpacity={0.85}
                    onPress={() => setSelectedCategoryId(category.id)}
                    style={[
                      styles.tagButton,
                      isSelected && styles.activeTagButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        isSelected && styles.activeTagText,
                      ]}
                    >
                      {category.category_name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Ionicons name="add" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>
          {/* details */}
          <View style={styles.section}>
            <Text style={styles.label}>DETAILS</Text>
            <TextInput
              value={details}
              onChangeText={setDetails}
              multiline
              textAlignVertical="top"
              placeholder="Description"
              placeholderTextColor="#A5A5A5"
              style={styles.detailsInput}
            />
          </View>
          {/* save button */}
          <View
            style={[styles.header, !isEditMode && { justifyContent: "center" }]}
          >
            <CustomButton
              title={isEditMode ? "SAVE CHANGES" : "ADD FOOD"}
              onPress={confirmSave}
              isLoading={isSaving}
              disabled={isSaving}
              buttonStyle={styles.saveButton}
              textStyle={styles.saveButtonText}
            />
            {isEditMode && (
              <CustomButton
                title="DELETE FOOD"
                onPress={confirmDelete}
                disabled={isSaving}
                buttonStyle={styles.deleteButton}
                textStyle={styles.deleteButtonText}
              />
            )}
          </View>
        </ScrollView>
        <Modal visible={showCategoryModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add categories</Text>
              <TextInput
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Name of category"
                style={styles.inputCategory}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddCategory}>
                  <Text style={{ color: "#FF7622" }}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {isSaving && (
          <View style={styles.overlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#FF7A1A" />
              <Text style={styles.loadingText}>
                {isEditMode ? "Updating food..." : "Creating food..."}
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingTop: 10,
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  resetText: {
    fontSize: 13,
    color: "#FF7A1A",
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    marginBottom: 12,
    letterSpacing: 1,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "white",
    color: "#222",
    fontSize: 15,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  priceInput: {
    width: "45%",
    minWidth: 140,
  },
  uploadContainer: {
    alignItems: "center",
  },
  previewBox: {
    width: "80%",
    aspectRatio: 1,
    maxWidth: 240,
    borderRadius: 28,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#DADADA",
    backgroundColor: "white",
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
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "#FFF3EA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  uploadText: {
    color: "#999",
    fontSize: 15,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tagButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    backgroundColor: "white",
  },
  activeTagButton: {
    backgroundColor: "#FF7A1A",
    borderColor: "#FF7A1A",
  },
  tagText: {
    color: "#222",
    fontSize: 13,
    fontWeight: "600",
  },
  activeTagText: {
    color: "white",
  },
  detailsInput: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 18,
    backgroundColor: "white",
    padding: 16,
    fontSize: 15,
    color: "#222",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#FF7A1A",
    borderWidth: 1,
    borderColor: "#E86800",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    width: 240,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
  },
  statusContainer: {
    flexDirection: "row",
    gap: 14,
  },
  statusButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  activeAvailableButton: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  activeUnavailableButton: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  activeStatusText: {
    color: "white",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "red",
  },
  addCategoryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  addCategoryShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  inputCategory: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    marginTop: 20,
  },
});
