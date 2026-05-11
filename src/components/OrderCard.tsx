import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import CustomButton from "./CustomButton";
import { formatCurrency } from "../utils/formatters";

interface Props {
  status: "pending" | "preparing" | "delivering" | "completed" | "cancelled";
  customerName: string;
  customerId: string;
  totalPrice: number;
  time: string;
  avatarUrl?: string;
  onPress?: () => void;
  onActionPress?: () => void;
  onCancelPress?: () => void;
}

export default function OrderCard({
  status,
  customerName,
  totalPrice,
  time,
  avatarUrl,
  onPress,
  onActionPress,
  onCancelPress,
}: Props) {
  const getActionTitle = () => {
    switch (status) {
      case "pending":
        return "Confirm";

      case "preparing":
        return "Deliver";

      case "delivering":
        return "Complete";

      default:
        return null;
    }
  };

  const showButtons = status !== "completed" && status !== "cancelled";

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.topSection}>
        <Image
          source={{
            uri: avatarUrl || "https://i.pravatar.cc/150",
          }}
          style={styles.image}
        />
        {/* Thông tin đơn hàng */}
        <View style={styles.info}>
          <Text style={styles.time}>{time}</Text>
          <Text style={styles.name}>{customerName}</Text>
          <Text style={styles.price}>
            Total: {formatCurrency(totalPrice, "USD")}
          </Text>
        </View>
      </View>

      {showButtons ? (
        <View style={styles.buttonRow}>
          <CustomButton
            title={getActionTitle()!}
            buttonStyle={styles.doneButton}
            textStyle={styles.doneText}
            onPress={onActionPress}
          />
          <CustomButton
            title="Cancel"
            buttonStyle={styles.cancelButton}
            textStyle={styles.cancelText}
            onPress={onCancelPress}
          />
        </View>
      ) : (
        <View
          style={[
            styles.statusBadge,
            status === "completed" && styles.completedBadge,
            status === "cancelled" && styles.cancelledBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              status === "completed" && styles.completedText,
              status === "cancelled" && styles.cancelledText,
            ]}
          >
            {status.toUpperCase()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 18,
    marginBottom: 20,
  },

  topSection: {
    flexDirection: "row",
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: "#A8B5C7",
    marginRight: 18,
  },

  info: {
    flex: 1,
    justifyContent: "space-between",
  },

  time: {
    fontSize: 13,
    color: "#B1B1B1",
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  id: {
    fontSize: 15,
    color: "#9E9E9E",
  },

  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },

  doneButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 18,
    paddingVertical: 14,
  },

  doneText: {
    fontSize: 15,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#EF4444",
    borderRadius: 18,
    paddingVertical: 14,
  },

  cancelText: {
    color: "#EF4444",
    fontSize: 15,
  },

  statusBadge: {
    marginTop: 22,
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },

  completedBadge: {
    backgroundColor: "#E9FFF0",
  },

  cancelledBadge: {
    backgroundColor: "#FFECEC",
  },

  statusText: {
    fontWeight: "700",
    fontSize: 13,
  },

  completedText: {
    color: "#10b93a",
  },

  cancelledText: {
    color: "#EF4444",
  },
});
