import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationService } from '../../services/location.service';
import { Coordinate } from '../../types/location';
import { useLocationStore } from '../../store/useLocationStore';
import { AddressService } from '../../services/address.service';
import { getOrderAddress } from '../../services/order.service';

const { width, height } = Dimensions.get('window');

// Toạ độ giả định của Cửa hàng (Trường ĐH Công nghệ thông tin - UIT)
const STORE_LOCATION: Coordinate = {
  latitude: 10.8700089,
  longitude: 106.8030541,
};

export default function OrderTrackingScreen({ route, navigation }: any) {
  const { orderId, role = 'customer' } = route.params || {};
  const mapRef = useRef<MapView>(null);
  
  const { currentLocation } = useLocationStore();
  const [customerLocation, setCustomerLocation] = useState<Coordinate | null>(null);
  
  const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);
  const [shipperLocation, setShipperLocation] = useState<Coordinate>(STORE_LOCATION);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [estimatedMinutes, setEstimatedMinutes] = useState(20);
  const [remainingTime, setRemainingTime] = useState<string>('20:00');

  useEffect(() => {
    setupTracking();
  }, []);

  const setupTracking = async () => {
    setLoading(true);
    let targetLoc: Coordinate | null = null;

    try {
      // 1. Lấy chuỗi địa chỉ giao hàng của Order này
      const deliveryAddress = await getOrderAddress(orderId);

      if (deliveryAddress) {
        // 2. Thử tìm trong danh sách sổ địa chỉ của User xem có lưu toạ độ không
        const addrRes = await AddressService.getAddresses();
        const matchedAddr = addrRes.data?.find(a => a.address === deliveryAddress);
        
        if (matchedAddr && matchedAddr.latitude && matchedAddr.longitude) {
          targetLoc = { latitude: matchedAddr.latitude, longitude: matchedAddr.longitude };
        }
      }
    } catch (e) {
      console.log('Error fetching order address', e);
    }

    // 3. Fallback: Nếu không tìm thấy toạ độ thực, tạo toạ độ nội suy dựa trên orderId để không bị trùng lặp các đơn
    if (!targetLoc) {
      const baseLoc = currentLocation || (await LocationService.getCurrentLocation()).coords;
      const offsetLat = (orderId % 10) * 0.003; // Lệch khoảng 300m - 3km tuỳ ID
      const offsetLon = ((orderId * 7) % 10) * 0.003;
      targetLoc = {
        latitude: baseLoc.latitude + (orderId % 2 === 0 ? offsetLat : -offsetLat),
        longitude: baseLoc.longitude + (orderId % 3 === 0 ? offsetLon : -offsetLon),
      };
    }

    setCustomerLocation(targetLoc);

    // 4. Tính toán lộ trình bằng OSRM
    await fetchOSRMRoute(STORE_LOCATION, targetLoc);

    // 5. Tính thời gian dự kiến (Dưới 10km = 20 phút. Vượt 10km mỗi km thêm 3 phút)
    const distance = LocationService.calculateDistance(
      STORE_LOCATION.latitude, STORE_LOCATION.longitude,
      targetLoc.latitude, targetLoc.longitude
    );
    let est = 20;
    if (distance > 10) {
      est = 20 + Math.ceil(distance - 10) * 3;
    }
    setEstimatedMinutes(est);
    setLoading(false);
  };

  const fetchOSRMRoute = async (start: Coordinate, end: Coordinate) => {
    try {
      const url = `http://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=geojson&overview=full`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.routes && json.routes.length > 0) {
        const coords = json.routes[0].geometry.coordinates.map((c: any) => ({
          latitude: c[1],
          longitude: c[0],
        }));
        setRouteCoords(coords);
      } else {
        setRouteCoords([start, end]);
      }
    } catch (e) {
      console.log('Error fetching route:', e);
      setRouteCoords([start, end]); // Fallback đường thẳng
    }
  };

  // Vòng lặp mô phỏng
  useEffect(() => {
    if (routeCoords.length < 2 || loading) return;

    // Giả lập thời gian thực chạy nhanh hơn thực tế 1 chút để demo
    // Ví dụ: 1 phút ngoài đời = 1 giây trong demo (60 lần nhanh hơn)
    const SIMULATION_SPEED = 60; 
    const totalMs = estimatedMinutes * 60 * 1000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) * SIMULATION_SPEED;
      let newProgress = elapsed / totalMs;
      
      if (newProgress >= 1) {
        newProgress = 1;
        clearInterval(interval);
        setRemainingTime('00:00');
        // Hoàn thành
        if (role === 'customer') {
           // Có thể navigate tới Success
        }
      }

      setProgress(newProgress);
      
      // Tính vị trí shipper hiện tại dựa vào newProgress trên mảng routeCoords
      const targetIndex = Math.floor(newProgress * (routeCoords.length - 1));
      setShipperLocation(routeCoords[targetIndex]);

      // Cập nhật đồng hồ đếm ngược
      const msLeft = Math.max(0, totalMs - elapsed);
      const mins = Math.floor(msLeft / 60000);
      const secs = Math.floor((msLeft % 60000) / 1000);
      setRemainingTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

    }, 1000);

    return () => clearInterval(interval);
  }, [routeCoords, loading]);

  // Căn chỉnh bản đồ
  useEffect(() => {
    if (routeCoords.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoords, {
        edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
        animated: true,
      });
    }
  }, [routeCoords]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7622" />
        <Text style={styles.loadingText}>Đang thiết lập lộ trình...</Text>
      </View>
    );
  }

  // Cắt đoạn đường đã đi qua
  const activeRoute = routeCoords.slice(Math.floor(progress * (routeCoords.length - 1)));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Nút Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#181C2E" />
      </TouchableOpacity>

      {/* Bản đồ */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: STORE_LOCATION.latitude,
          longitude: STORE_LOCATION.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Đường đi chưa tới */}
        {activeRoute.length > 0 && (
          <Polyline
            coordinates={activeRoute}
            strokeWidth={4}
            strokeColor="#FF7622"
            lineDashPattern={[0]}
          />
        )}
        
        {/* Cửa hàng */}
        <Marker coordinate={STORE_LOCATION} title="Cửa hàng">
          <View style={styles.markerStore}>
            <Ionicons name="restaurant" size={20} color="#FFF" />
          </View>
        </Marker>

        {/* Khách hàng */}
        {customerLocation && (
          <Marker coordinate={customerLocation} title="Bạn">
            <View style={styles.markerHome}>
              <Ionicons name="home" size={20} color="#FFF" />
            </View>
          </Marker>
        )}

        {/* Shipper */}
        <Marker coordinate={shipperLocation} title="Tài xế">
          <View style={styles.markerShipper}>
            <Ionicons name="bicycle" size={24} color="#FFF" />
          </View>
        </Marker>
      </MapView>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Dự kiến đến nơi</Text>
          <Text style={styles.timeValue}>{remainingTime}</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {role === 'customer' ? "Tài xế đang trên đường giao món đến bạn" : "Bạn đang giao hàng cho khách"}
          </Text>
        </View>

        <View style={styles.divider} />

        {role === 'customer' ? (
          // View cho Khách hàng
          <View style={styles.profileRow}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#FFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Tài xế #TX123</Text>
              <Text style={styles.profileRole}>Giao hàng nhanh</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : (
          // View cho Owner
          <View style={styles.ownerActions}>
            <TouchableOpacity style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Huỷ giao</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.completeBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.completeText}>Hoàn thành</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#A0A5BA',
    fontSize: 16,
  },
  map: {
    width: width,
    height: height,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: '#FFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markerStore: {
    width: 36,
    height: 36,
    backgroundColor: '#181C2E',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  markerHome: {
    width: 36,
    height: 36,
    backgroundColor: '#32CD32',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  markerShipper: {
    width: 44,
    height: 44,
    backgroundColor: '#FF7622',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E4F5',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    color: '#A0A5BA',
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#181C2E',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    backgroundColor: '#FF7622',
    borderRadius: 5,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#181C2E',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#A0A5BA',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181C2E',
  },
  profileRole: {
    fontSize: 14,
    color: '#A0A5BA',
    marginTop: 4,
  },
  callBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FF7622',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#181C2E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  completeBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#FF7622',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
