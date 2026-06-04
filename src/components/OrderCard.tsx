import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import CustomButton from "./CustomButton";
import { formatCurrency, formatRelativeTime } from "../utils/formatters";

interface Props {
  status: "pending" | "preparing" | "delivering" | "completed" | "cancelled";
  customerName: string;
  customerId: string;
  totalPrice: number;
  time: Date;
  avatarUrl?: string;
  onPress?: () => void;
  onActionPress?: () => void;
  onCancelPress?: () => void;
  actionLoading?: boolean;
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
  actionLoading,
}: Props) {
  const getActionTitle = () => {
    switch (status) {
      case "pending":
        return "Xác nhận";

      case "preparing":
        return "Giao hàng";

      case "delivering":
        return "Hoàn thành";

      default:
        return null;
    }
  };

  const showButtons = status !== "completed" && status !== "cancelled";

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.topSection}>
        <Image
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require("../../assets/default_avt.png")
          }
          style={styles.image}
        />
        {/* Thông tin đơn hàng */}
        <View style={styles.info}>
          <Text style={styles.time}>{formatRelativeTime(time, false)}</Text>
          <Text style={styles.name}>{customerName}</Text>
          <Text style={styles.price}>
            Total: {formatCurrency(totalPrice, "VND")}
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
            disabled={actionLoading}
            isLoading={actionLoading}
          />
          <CustomButton
            title="Hủy"
            buttonStyle={styles.cancelButton}
            textStyle={styles.cancelText}
            onPress={onCancelPress}
            disabled={actionLoading}
            isLoading={actionLoading}
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
            {status === "completed"
              ? "Hoàn thành"
              : status === "cancelled"
                ? "Đã hủy"
                : status}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  topSection: {
    flexDirection: "row",
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 18,
    backgroundColor: "#EEE",
  },

  info: {
    flex: 1,
    justifyContent: "space-between",
  },

  time: {
    fontSize: 11,
    color: "#B1B1B1",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  id: {
    fontSize: 15,
    color: "#9E9E9E",
  },

  price: {
    fontSize: 13,
    fontWeight: "normal",
    color: "#222",
    textAlign: "right",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },

  doneButton: {
    width: 100,
    borderRadius: 12,
    paddingVertical: 10,
  },

  doneText: {
    fontSize: 11,
  },

  cancelButton: {
    width: 100,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 10,
  },

  cancelText: {
    color: "#EF4444",
    fontSize: 11,
  },

  statusBadge: {
    marginTop: 22,
    alignSelf: "flex-end",
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
    fontSize: 11,
  },

  completedText: {
    color: "#10b93a",
  },

  cancelledText: {
    color: "#EF4444",
  },
});
