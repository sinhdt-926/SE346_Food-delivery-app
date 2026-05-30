import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../../components/BackButton";
import CustomButton from "../../components/CustomButton";
import {
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../../services/promotion.service";
import { Promotion } from "../../types/promotion";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

export default function AddEditPromotionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingPromotion: Promotion | undefined = route.params?.promotion;
  const isEditMode = useMemo(() => {
    return !!editingPromotion;
  }, [editingPromotion]);
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const allowExitRef = useRef(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    if (!editingPromotion) return;
    setName(editingPromotion.name);
    setDiscountType(editingPromotion.discount_type);
    setDiscountValue(String(editingPromotion.discount_value));
    setStartDate(editingPromotion.start_date.slice(0, 10));
    setEndDate(editingPromotion.end_date.slice(0, 10));
    setIsActive(editingPromotion.is_active);
  }, [editingPromotion]);

  const hasChanges = useMemo(() => {
    if (!editingPromotion) {
      return name.trim() !== "" || discountValue.trim() !== "";
    }
    return (
      name !== editingPromotion.name ||
      discountType !== editingPromotion.discount_type ||
      discountValue !== String(editingPromotion.discount_value) ||
      startDate !== editingPromotion.start_date.slice(0, 10) ||
      endDate !== editingPromotion.end_date.slice(0, 10) ||
      isActive !== editingPromotion.is_active
    );
  }, [
    name,
    discountType,
    discountValue,
    startDate,
    endDate,
    isActive,
    editingPromotion,
  ]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (allowExitRef.current || !hasChanges || isSaving) {
        return;
      }
      e.preventDefault();
      Alert.alert("Unsaved Changes", "Save before leaving?", [
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
      ]);
    });
    return unsubscribe;
  }, [navigation, hasChanges, isSaving]);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter promotion name");
      return false;
    }
    const value = Number(discountValue);
    if (discountValue.trim() === "" || isNaN(value)) {
      Alert.alert("Invalid Discount");
      return false;
    }
    if (discountType === "percent" && (value <= 0 || value > 100)) {
      Alert.alert("Percent must be 1 - 100");
      return false;
    }
    if (discountType === "fixed" && value <= 0) {
      Alert.alert("Amount must be > 0");
      return false;
    }
    if (!startDate || !endDate) {
      Alert.alert("Please enter dates");
      return false;
    }
    if (endDate <= startDate) {
      Alert.alert("The end date must be after the start date.");
      return false;
    }
    return true;
  };

  const handleSave = async (): Promise<boolean> => {
    if (!validateForm()) return false;
    try {
      setIsSaving(true);
      const payload = {
        name: name.trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
      };

      if (isEditMode && editingPromotion) {
        await updatePromotion(editingPromotion.id, payload);
      } else {
        await createPromotion(payload);
      }
      Alert.alert(
        "Success",
        isEditMode ? "Promotion updated" : "Promotion created",
      );
      return true;
    } catch (error) {
      Alert.alert("Error", isEditMode ? "Update failed" : "Create failed");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const confirmSave = () => {
    Alert.alert("Confirm", isEditMode ? "Save changes?" : "Create promotion?", [
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
    ]);
  };
  const confirmDelete = () => {
    Alert.alert("Delete Promotion", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: handleDelete,
      },
    ]);
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      await deletePromotion(editingPromotion!.id);
      Alert.alert("Success", "Promotion deleted");
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Delete failed");
    } finally {
      setIsSaving(false);
    }
  };
  const handleReset = () => {
    if (editingPromotion) {
      setName(editingPromotion.name);
      setDiscountType(editingPromotion.discount_type);
      setDiscountValue(String(editingPromotion.discount_value));
      setStartDate(editingPromotion.start_date.slice(0, 10));
      setEndDate(editingPromotion.end_date.slice(0, 10));
      setIsActive(editingPromotion.is_active);
      return;
    }
    setName("");
    setDiscountType("percent");
    setDiscountValue("");
    setStartDate("");
    setEndDate("");
    setIsActive(true);
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
      >
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Promotion" : "Add Promotion"}
          </Text>
          <TouchableOpacity activeOpacity={0.8} onPress={confirmReset}>
            <Text style={styles.resetText}>RESET</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={styles.section}>
            <Text style={styles.label}>PROMOTION NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>DISCOUNT TYPE</Text>
            <View style={styles.typeContainer}>
              {["percent", "fixed"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setDiscountType(type)}
                  style={[
                    styles.typeButton,
                    discountType === type && styles.activeButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      discountType === type && styles.activeText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>
              {discountType === "percent" ? "DISCOUNT (%)" : "DISCOUNT AMOUNT"}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={discountValue}
              onChangeText={setDiscountValue}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>START DATE</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text>{startDate}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text>{endDate}</Text>
          </TouchableOpacity>
          <View
            style={[styles.header, !isEditMode && { justifyContent: "center" }]}
          >
            <CustomButton
              title={isEditMode ? "SAVE CHANGES" : "ADD PROMOTION"}
              onPress={confirmSave}
              isLoading={isSaving}
              disabled={isSaving}
              buttonStyle={styles.saveButton}
              textStyle={styles.saveButtonText}
            />
            {isEditMode && (
              <CustomButton
                title="DELETE"
                onPress={confirmDelete}
                disabled={isSaving}
                buttonStyle={styles.deleteButton}
                textStyle={styles.deleteButtonText}
              />
            )}
          </View>
        </ScrollView>
        {showStartPicker && (
          <DateTimePicker
            value={new Date(startDate)}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartPicker(false);

              if (selectedDate) {
                setStartDate(selectedDate.toISOString().split("T")[0]);
              }
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={new Date(endDate)}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) {
                setEndDate(selectedDate.toISOString().split("T")[0]);
              }
            }}
          />
        )}
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
    paddingTop: 20,
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
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  activeButton: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  typeText: {
    fontWeight: "700",
  },
  activeText: {
    color: "white",
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  dateInput: {
    height: 56,
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
});
