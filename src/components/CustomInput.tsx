import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomInputProps extends TextInputProps {
  label?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  containerStyle?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode;
}

export default function CustomInput({
  label,
  iconName,
  containerStyle,
  rightElement,
  ...props
}: CustomInputProps) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Hiện Label nếu có truyền vào */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Khối bọc Input và Icon */}
      <View style={styles.inputContainer}>
        {/* Hiện Icon nếu có truyền vào */}
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color="#A0A5BA"
            style={styles.icon}
          />
        )}

        <TextInput
          style={styles.input}
          placeholderTextColor="#A0A5BA"
          {...props}
        />
        
        {/* Hiện Right Element (Ví dụ: Nút xóa, Nút hiển thị mật khẩu) */}
        {rightElement && (
          <View style={styles.rightElementContainer}>
            {rightElement}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 12,
    color: "#A0A5BA",
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5FA",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#32343E",
    height: "100%",
  },
  rightElementContainer: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
