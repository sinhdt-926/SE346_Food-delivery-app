type CurrencyType = "VND" | "USD";

export const formatCurrency = (
  value: number,
  currency: CurrencyType = "VND",
) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
};
