import * as Location from "expo-location";

export interface Coordinate {
  latitude: number;
  longitude: number;
}

// 1. Tọa độ cửa hàng cố định (Trường ĐH Công nghệ thông tin - UIT)
export const STORE_COORDINATE: Coordinate = {
  latitude: 10.8700089,
  longitude: 106.8030541,
};

// 2. Tọa độ dự phòng (Nhà Văn hoá Sinh Viên, Đông Hoà, TP.HCM)
export const FALLBACK_COORDINATE: Coordinate = {
  latitude: 10.87522,
  longitude: 106.80074,
};

export const LocationService = {
  /**
   * Tính khoảng cách đường chim bay giữa 2 toạ độ (Haversine formula)
   * @param lat1 Vĩ độ điểm 1
   * @param lon1 Kinh độ điểm 1
   * @param lat2 Vĩ độ điểm 2
   * @param lon2 Kinh độ điểm 2
   * @returns Khoảng cách theo đơn vị Kilomet (km)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  },

  /**
   * Xin quyền GPS và lấy toạ độ hiện tại của thiết bị
   * @returns Coordinate toạ độ thực tế hoặc FALLBACK_COORDINATE nếu bị từ chối
   */
  async getCurrentLocation(): Promise<{ coords: Coordinate; isFallback: boolean }> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return { coords: FALLBACK_COORDINATE, isFallback: true };
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      return {
        coords: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
        isFallback: false,
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      return { coords: FALLBACK_COORDINATE, isFallback: true };
    }
  },

  /**
   * Chuyển đổi toạ độ địa lý (vĩ độ, kinh độ) ngược thành tên địa chỉ thực (Reverse Geocoding)
   * @param coords Toạ độ cần lấy địa chỉ
   * @returns Chuỗi tên địa chỉ (vd: "Đường, Phường, Thành phố")
   */
  async getAddressFromCoords(coords: Coordinate): Promise<string> {
    try {
      const geocode = await Location.reverseGeocodeAsync(coords);

      if (geocode && geocode.length > 0) {
        // Ưu tiên dùng formattedAddress từ kết quả đầu tiên nếu có và làm sạch nó (bỏ Plus Code)
        const firstPlace = geocode[0];
        if (firstPlace.formattedAddress) {
          const cleaned = firstPlace.formattedAddress
            .split(",")
            .map(part => part.trim())
            .filter(part => part && !part.includes("+"))
            .join(", ");
          if (cleaned) {
            return cleaned;
          }
        }

        // Phương án dự phòng: Hợp nhất các thành phần địa chỉ từ tất cả kết quả trả về
        let streetNumber = "";
        let street = "";
        let district = "";
        let subregion = "";
        let city = "";
        let region = "";
        let name = "";

        for (const place of geocode) {
          if (!streetNumber && place.streetNumber) streetNumber = place.streetNumber;
          if (!street && place.street && !place.street.includes("+")) street = place.street;
          if (!district && place.district && !place.district.includes("+")) district = place.district;
          if (!subregion && place.subregion && !place.subregion.includes("+")) subregion = place.subregion;
          if (!city && place.city) city = place.city;
          if (!region && place.region) region = place.region;
          if (!name && place.name && !place.name.includes("+")) name = place.name;
        }

        const namePart = name && name !== streetNumber ? name : null;
        const formattedAddress = [
          namePart,
          streetNumber,
          street,
          district,
          subregion,
          city || region,
        ]
          .filter((val, index, self) => val && self.indexOf(val) === index) // Loại bỏ các giá trị rỗng và trùng lặp
          .join(", ");

        return formattedAddress || `Toạ độ: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
      }
      return `Toạ độ: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
    } catch (error) {
      console.error("Error getting address from coords:", error);
      return `Toạ độ: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
    }
  },
};
