import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import CustomButton from "./CustomButton";

type OrderItemProps = {
  type: "ongoing" | "history";
  order: {
    id: string | number;
    created_at: Date | string;
    updated_at?: Date | string;
    status: "pending" | "delivering" | "preparing" | "completed" | "cancelled" | string;
    items: { name: string; quantity: number; image_url?: string }[];
    total: number;
  };
  onViewDetail?: () => void;
  onTrackOrder?: () => void;
  onCancel?: () => void;
  onRate?: () => void;
  onReOrder?: () => void;
};

export default function OrderItem({
  type,
  order,
  onViewDetail,
  onTrackOrder,
  onCancel,
  onRate,
  onReOrder,
}: OrderItemProps) {
  // 1. Xử lý trạng thái và màu sắc
  const getStatusDisplay = () => {
    switch (order.status) {
      case "delivering":
        return { text: "Đang giao", colorStyle: styles.textEmerald };
      case "completed":
        return { text: "Đã giao", colorStyle: styles.textGreen };
      case "preparing":
        return { text: "Đang chuẩn bị", colorStyle: styles.textOrange };
      case "pending":
        return { text: "Chờ xác nhận", colorStyle: styles.textOrange };
      case "cancelled":
        return { text: "Đã huỷ", colorStyle: styles.textRed };
      default:
        return { text: order.status, colorStyle: styles.textGray };
    }
  };

  const statusInfo = getStatusDisplay();

  // 2. Xử lý tóm tắt tên món ăn
  const getOrderTitle = () => {
    if (!order.items || order.items.length === 0) return "Đơn hàng không rõ";
    const firstItemName = order.items[0].name;
    const remainingCount = order.items.length - 1;
    return remainingCount > 0
      ? `${firstItemName} & ${remainingCount} món khác`
      : firstItemName;
  };

  // 3. Xử lý hiển thị ngày/ETA
  const getHeaderDate = () => {
    const timeToFormat =
      order.status === "completed" || order.status === "cancelled"
        ? order.updated_at || order.created_at
        : order.created_at;

    const date = new Date(timeToFormat as string);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month} - ${hours}:${minutes}`;
  };

  return (
    <View style={styles.card}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <Text style={styles.headerDate}>{getHeaderDate()}</Text>
        <Text style={[styles.statusText, statusInfo.colorStyle]}>
          {statusInfo.text}
        </Text>
      </View>

      {/* --- BODY --- */}
      <View style={styles.body}>
        {/* Hình ảnh đại diện */}
        {order.items && order.items.length > 0 && order.items[0].image_url ? (
          <Image source={{ uri: order.items[0].image_url }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnail} />
        )}

        {/* Thông tin đơn hàng */}
        <View style={styles.infoContainer}>
          {/* Dòng 1 */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {getOrderTitle()}
            </Text>
            <TouchableOpacity onPress={onViewDetail} activeOpacity={0.7}>
              <Text style={styles.viewDetail}>Chi tiết</Text>
            </TouchableOpacity>
          </View>

          {/* Dòng 2 */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{order.total?.toLocaleString("vi-VN")}đ</Text>
            <View style={styles.dot} />
            <Text style={styles.itemsCount}>
              {order.items.length < 10
                ? `0${order.items.length}`
                : order.items.length}{" "}
              Món
            </Text>
          </View>
        </View>
      </View>

      {/* --- FOOTER --- */}
      <View style={styles.footer}>
        {type === "ongoing" && (
          <>
            {['pending', 'preparing', 'delivering'].includes(order.status) && (
              <View style={styles.buttonWrapper}>
                <CustomButton
                  title="Theo dõi đơn"
                  onPress={onTrackOrder}
                  buttonStyle={styles.solidButton}
                />
              </View>
            )}
            {order.status === 'pending' && (
              <View style={styles.buttonWrapper}>
                <CustomButton
                  title="Huỷ đơn"
                  onPress={onCancel}
                  buttonStyle={styles.outlineButton}
                  textStyle={styles.outlineText}
                />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Card layout
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Header
  header: {
    marginTop: 12,
    marginHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6", // gray-100
  },
  headerDate: {
    color: "#6B7280", // gray-500
    fontSize: 14,
    fontWeight: "500",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  // Trạng thái màu sắc
  textGreen: { color: "#10b93a" },
  textEmerald: { color: "#07a39b" },
  textOrange: { color: "#FF7622" },
  textRed: { color: "#EF4444" },
  textGray: { color: "#6B7280" },

  // Body
  body: {
    margin: 8,
    flexDirection: "row",
    paddingVertical: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    backgroundColor: "#94A3B8",
    borderRadius: 12,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  viewDetail: {
    color: "#9CA3AF",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1F2937",
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: "#9CA3AF",
    borderRadius: 2,
    marginHorizontal: 8,
  },
  itemsCount: {
    color: "#6B7280",
    fontSize: 14,
  },

  // Footer & Buttons
  footer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  buttonWrapper: {
    margin: 8,
    flex: 1,
  },
  solidButton: {
    paddingVertical: 12,
    elevation: 0,
    shadowOpacity: 0,
    width: "auto",
  },
  outlineButton: {
    paddingVertical: 12,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#FF7622",
    elevation: 0,
    shadowOpacity: 0,
    width: "auto",
  },
  outlineText: {
    color: "#FF7622",
    textTransform: "none",
  },
});
