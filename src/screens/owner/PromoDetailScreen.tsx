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
  Image,
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
import { getLocalDateString } from "../../utils/date";
import * as ImagePicker from "expo-image-picker";

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
  const [minOrderValue, setMinOrderValue] = useState(""); // nullable — empty string = NULL
  const [isSaving, setIsSaving] = useState(false);
  const allowExitRef = useRef(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDate, setStartDate] = useState(getLocalDateString());
  const [endDate, setEndDate] = useState(getLocalDateString());
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!editingPromotion) return;
    setName(editingPromotion.name);
    setDiscountType(editingPromotion.discount_type);
    setDiscountValue(String(editingPromotion.discount_value));
    setStartDate(editingPromotion.start_date.slice(0, 10));
    setEndDate(editingPromotion.end_date.slice(0, 10));
    setIsActive(editingPromotion.is_active);
    setMinOrderValue(
      editingPromotion.min_order_value != null
        ? String(editingPromotion.min_order_value)
        : "",
    );
    setImage(editingPromotion.image_url ?? null);
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
      isActive !== editingPromotion.is_active ||
      minOrderValue !==
        (editingPromotion.min_order_value != null
          ? String(editingPromotion.min_order_value)
          : "") ||
      image !== (editingPromotion.image_url ?? null)
    );
  }, [
    name,
    discountType,
    discountValue,
    startDate,
    endDate,
    isActive,
    minOrderValue,
    image,
    editingPromotion,
  ]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (allowExitRef.current || !hasChanges || isSaving) {
        return;
      }
      e.preventDefault();
      Alert.alert("Thay đổi chưa được lưu", "Lưu trước khi rời đi?", [
        {
          text: "Tiếp tục",
          style: "destructive",
          onPress: () => {
            allowExitRef.current = true;
            navigation.goBack();
          },
        },
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Lưu",
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
      Alert.alert(
        "Tên chương trình không hợp lệ",
        "Vui lòng nhập tên chương trình khuyến mãi",
      );
      return false;
    }
    const value = Number(discountValue);
    if (discountValue.trim() === "" || isNaN(value)) {
      Alert.alert("Mã giảm giá không hợp lệ");
      return false;
    }
    if (discountType === "percent" && (value <= 0 || value > 100)) {
      Alert.alert("Tỷ lệ phần trăm phải nằm trong khoảng từ 1 đến 100");
      return false;
    }
    if (discountType === "fixed" && value <= 0) {
      Alert.alert("Số tiền phải lớn hơn 0");
      return false;
    }
    if (!startDate || !endDate) {
      Alert.alert("Vui lòng nhập ngày tháng");
      return false;
    }
    if (endDate <= startDate) {
      Alert.alert("Ngày kết thúc phải sau ngày bắt đầu");
      return false;
    }
    const minVal = Number(minOrderValue);
    if (minOrderValue.trim() !== "" && (isNaN(minVal) || minVal < 0)) {
      Alert.alert("Invalid minimum order value", "Must be a number >= 0");
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
        min_order_value:
          minOrderValue.trim() !== "" ? Number(minOrderValue) : undefined,
        image_url: image ?? undefined,
      };

      if (isEditMode && editingPromotion) {
        await updatePromotion(editingPromotion.id, payload);
      } else {
        await createPromotion(payload);
      }
      Alert.alert(
        "Thành công",
        isEditMode
          ? "Chương trình khuyến mãi đã được cập nhật"
          : "Chương trình khuyến mãi đã được tạo",
      );
      return true;
    } catch (error) {
      Alert.alert(
        "Thất bại",
        isEditMode ? "Cập nhật thất bại" : "Tạo thất bại",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const confirmSave = () => {
    Alert.alert("Xác nhận", isEditMode ? "Lưu thay đổi?" : "Tạo khuyến mãi?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Lưu",
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
    Alert.alert("Xóa chương trình khuyến mãi", "Bạn có chắc không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: handleDelete,
      },
    ]);
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      await deletePromotion(editingPromotion!.id);
      Alert.alert("Thành công", "Chương trình khuyến mãi đã bị xóa");
      navigation.goBack();
    } catch {
      Alert.alert("Lỗi", "Xóa không thành công");
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
      setMinOrderValue(
        editingPromotion.min_order_value != null
          ? String(editingPromotion.min_order_value)
          : "",
      );
      return;
    }
    setName("");
    setDiscountType("percent");
    setDiscountValue("");
    setStartDate("");
    setEndDate("");
    setIsActive(true);
    setMinOrderValue("");
  };
  const confirmReset = () => {
    Alert.alert(
      "Xác nhận khôi phục",
      "Bạn có chắc chắn muốn khôi phục về trạng thái ban đầu không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Khôi phục",
          onPress: async () => {
            handleReset();
          },
        },
      ],
    );
  };
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Vui lòng cho phép truy cập vào thư viện ảnh",
        );
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
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
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
            {isEditMode ? "Chỉnh sửa" : "Thêm mới"}
          </Text>
          <TouchableOpacity activeOpacity={0.8} onPress={confirmReset}>
            <Text style={styles.resetText}>Khôi phục</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={styles.section}>
            <Text style={styles.label}>Tên chương trình</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Ảnh chương trình</Text>
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
                    <Text style={styles.uploadText}>Tải ảnh</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Loại giảm giá</Text>
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
                    {type === "percent" ? "Phần trăm" : "Số tiền cố định"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>
              {discountType === "percent" ? "Giảm giá (%)" : "Số tiền giảm giá"}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={discountValue}
              onChangeText={setDiscountValue}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>
              Giá trị đơn hàng tối thiểu (không bắt buộc)
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Để trống nếu không áp dụng"
              placeholderTextColor="#999"
              value={minOrderValue}
              onChangeText={setMinOrderValue}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Ngày bắt đầu</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text>{startDate}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Ngày kết thúc</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text>{endDate}</Text>
            </TouchableOpacity>
          </View>
          <View
            style={[styles.header, !isEditMode && { justifyContent: "center" }]}
          >
            <CustomButton
              title={isEditMode ? "Lưu Thay Đổi" : "Thêm Mới"}
              onPress={confirmSave}
              isLoading={isSaving}
              disabled={isSaving}
              buttonStyle={styles.saveButton}
              textStyle={styles.saveButtonText}
            />
            {isEditMode && (
              <CustomButton
                title="Xóa"
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
});
