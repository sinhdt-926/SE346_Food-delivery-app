import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

type Size = "small" | "medium" | "large";
type Props = {
  title: string;
  onPress: () => void;
  size?: "small" | "medium" | "large";
};

export default function CustomButton({
  title,
  onPress,
  size = "medium",
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, sizeStyles[size]]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FF7622",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontWeight: "600",
  },
});
const sizeStyles: Record<Size, ViewStyle> = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: "25%",
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "40%",
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: "90%",
  },
};
