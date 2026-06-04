type CurrencyType = "VND" | "USD";

export const formatCurrency = (
  value: number,
  currency: CurrencyType = "VND",
) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  })
    .format(value)
    .replace(/\s+/g, "");
};

export const formatRelativeTime = (date: Date | string, inDetail: boolean) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (inDetail === false || days <= 1) {
    // dưới 1 phút
    if (minutes < 1) {
      return "Vừa xong";
    }

    // dưới 1 giờ
    if (minutes < 60) {
      return `${minutes} phút trước`;
    }

    // dưới 24 giờ
    if (hours < 24) {
      return `${hours} giờ trước`;
    }

    // hôm qua
    if (days === 1) {
      return "Hôm qua";
    }
  }

  // quá 1 ngày
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(target);
};
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const parseDeliveryAddress = (rawAddress: string | null) => {
  if (!rawAddress) return { address: "", latitude: null, longitude: null };
  const parts = rawAddress.split("|coords:");
  if (parts.length === 2) {
    const coordsStr = parts[1].split(",");
    return {
      address: parts[0],
      latitude: parseFloat(coordsStr[0]),
      longitude: parseFloat(coordsStr[1]),
    };
  }
  return { address: rawAddress, latitude: null, longitude: null };
};
