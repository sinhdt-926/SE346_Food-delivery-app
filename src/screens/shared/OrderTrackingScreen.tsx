import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";
import LottieView from "lottie-react-native";
import {
  getOrderAddress,
  subscribeToOrderUpdates,
} from "../../services/order.service";
import { LocationService } from "../../services/location.service";
import { Coordinate } from "../../types/location";
import { useLocationStore } from "../../store/useLocationStore";
import { AddressService } from "../../services/address.service";

const { width, height } = Dimensions.get("window");

const STORE_LOCATION: Coordinate = {
  latitude: 10.8700089,
  longitude: 106.8030541,
};

export default function OrderTrackingScreen({ navigation, route }: any) {
  const { orderId, role = "customer" } = route.params || {};
  const mapRef = useRef<MapView>(null);
  const { currentLocation } = useLocationStore();
  const [customerLocation, setCustomerLocation] = useState<Coordinate | null>(
    null,
  );

  const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);
  const [shipperLocation, setShipperLocation] =
    useState<Coordinate>(STORE_LOCATION);
  const [shipperRouteIndex, setShipperRouteIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [estimatedMinutes, setEstimatedMinutes] = useState(20);
  const [totalDistance, setTotalDistance] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);

  const [orderStatus, setOrderStatus] = useState<string>("pending");
  const [deliveryStartedAt, setDeliveryStartedAt] = useState<string | null>(
    null,
  );

  const translateY = useRef(new Animated.Value(0)).current;
  const MAX_TRANSLATE = 250;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0 && gestureState.dy <= MAX_TRANSLATE) {
          translateY.setValue(gestureState.dy);
        } else if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy * 0.1);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.spring(translateY, {
            toValue: MAX_TRANSLATE,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        } else {
          // Kéo lên hoặc kéo không đủ sâu -> Bật lại vị trí cũ
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    setupTracking();

    const unsubscribe = subscribeToOrderUpdates(orderId, (newOrderData) => {
      console.log("Order Updated via Realtime:", newOrderData);
      if (newOrderData.status) setOrderStatus(newOrderData.status);
      if (newOrderData.delivery_started_at)
        setDeliveryStartedAt(newOrderData.delivery_started_at);
    });

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  const setupTracking = async () => {
    setLoading(true);
    let targetLoc: Coordinate | null = null;

    try {
      const orderData = await getOrderAddress(orderId);
      if (orderData) {
        setOrderStatus(orderData.status);
        if (orderData.delivery_started_at) {
          setDeliveryStartedAt(orderData.delivery_started_at);
        }

        const deliveryAddress = orderData.delivery_address;
        if (deliveryAddress) {
          const addrRes = await AddressService.getAddresses();
          const matchedAddr = addrRes.data?.find(
            (a) => a.address === deliveryAddress,
          );
          if (matchedAddr && matchedAddr.latitude && matchedAddr.longitude) {
            targetLoc = {
              latitude: matchedAddr.latitude,
              longitude: matchedAddr.longitude,
            };
          }
        }
      }
    } catch (e) {
      console.log("Error fetching order address", e);
    }

    if (!targetLoc) {
      const baseLoc =
        currentLocation || (await LocationService.getCurrentLocation()).coords;
      const offsetLat = (orderId % 10) * 0.003;
      const offsetLon = ((orderId * 7) % 10) * 0.003;
      targetLoc = {
        latitude:
          baseLoc.latitude + (orderId % 2 === 0 ? offsetLat : -offsetLat),
        longitude:
          baseLoc.longitude + (orderId % 3 === 0 ? offsetLon : -offsetLon),
      };
    }

    setCustomerLocation(targetLoc);
    await fetchOSRMRoute(STORE_LOCATION, targetLoc);

    const distance = LocationService.calculateDistance(
      STORE_LOCATION.latitude,
      STORE_LOCATION.longitude,
      targetLoc.latitude,
      targetLoc.longitude,
    );
    const est = Math.max(1, Math.ceil(distance * 2));
    setEstimatedMinutes(est);
    setTotalDistance(distance);
    setRemainingDistance(distance);
    setLoading(false);
  };

  const fetchOSRMRoute = async (start: Coordinate, end: Coordinate) => {
    try {
      const url = `https://routing.openstreetmap.de/routed-bike/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=geojson&overview=full`;
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
      setRouteCoords([start, end]);
    }
  };

  useEffect(() => {
    if (routeCoords.length < 2 || loading) return;

    if (orderStatus !== "delivering" && orderStatus !== "completed") {
      setShipperLocation(STORE_LOCATION);
      return;
    }

    if (orderStatus === "completed") {
      setShipperLocation(routeCoords[routeCoords.length - 1]);
      return;
    }

    if (orderStatus === "delivering" && deliveryStartedAt) {
      const startTime = new Date(deliveryStartedAt).getTime();
      const totalMs = estimatedMinutes * 60 * 1000;
      const SIMULATION_SPEED_MULTIPLIER = 1;

      const interval = setInterval(() => {
        // Đảm bảo elapsed không bao giờ bị âm do sai lệch thời gian (Clock Skew) giữa Server và Client
        const elapsed =
          Math.max(0, Date.now() - startTime) * SIMULATION_SPEED_MULTIPLIER;
        let progress = elapsed / totalMs;

        if (progress >= 1) {
          progress = 1;
          clearInterval(interval);
        }

        // Clamp targetIndex cẩn thận
        let targetIndex = Math.floor(progress * (routeCoords.length - 1));
        if (targetIndex < 0) targetIndex = 0;
        if (targetIndex >= routeCoords.length)
          targetIndex = routeCoords.length - 1;

        const nextLocation = routeCoords[targetIndex];
        if (nextLocation) {
          setShipperLocation(nextLocation);
        }

        setShipperRouteIndex(targetIndex);
        setRemainingDistance((1 - progress) * totalDistance);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [routeCoords, loading, orderStatus, deliveryStartedAt]);

  useEffect(() => {
    if (!loading && customerLocation && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [STORE_LOCATION, shipperLocation, customerLocation],
        {
          edgePadding: { top: 50, right: 50, bottom: 400, left: 50 },
          animated: true,
        },
      );
    }
  }, [loading, customerLocation, shipperLocation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#181C2E" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: STORE_LOCATION.latitude,
            longitude: STORE_LOCATION.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {routeCoords.length > 0 && (
            <>
              <Polyline
                coordinates={routeCoords.slice(0, shipperRouteIndex + 1)}
                strokeColor="#f7d7bcff"
                strokeWidth={5}
              />
              <Polyline
                coordinates={routeCoords.slice(shipperRouteIndex)}
                strokeColor="#FF7622"
                strokeWidth={5}
              />
            </>
          )}

          <Marker coordinate={STORE_LOCATION} title="Nhà hàng">
            <View
              style={[styles.markerContainer, { backgroundColor: "#181C2E" }]}
            >
              <Ionicons name="restaurant" size={10} color="#FFF" />
            </View>
          </Marker>

          {customerLocation && (
            <Marker coordinate={customerLocation} title="Bạn">
              <View
                style={[styles.markerContainer, { backgroundColor: "#FF7622" }]}
              >
                <Ionicons name="home" size={10} color="#FFF" />
              </View>
            </Marker>
          )}

          {orderStatus === "delivering" && (
            <Marker coordinate={shipperLocation} title="Shipper">
              <View style={styles.shipperMarker}>
                <Ionicons name="bicycle" size={20} color="#FFF" />
              </View>
            </Marker>
          )}
        </MapView>
      )}

      {orderStatus === "delivering" && (
        <Animated.View
          style={[styles.bottomSheet, { transform: [{ translateY }] }]}
        >
          <View {...panResponder.panHandlers} style={styles.dragArea}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.sheetContent}>
            <Text style={styles.estimatedText}>
              THỜI GIAN GIAO HÀNG DỰ KIẾN
            </Text>
            <Text style={styles.timeText}>{estimatedMinutes} phút</Text>

            {remainingDistance > 0 && remainingDistance < 1 && (
              <Text style={styles.arrivingSoonText}>
                Đơn hàng sắp đến, vui lòng chú ý điện thoại
              </Text>
            )}

            {remainingDistance === 0 && (
              <Text style={styles.arrivedText}>Đơn hàng của bạn đã đến</Text>
            )}

            <View style={styles.lottieWrapper}>
              <LottieView
                autoPlay
                loop
                source={require("../../../assets/lottie/Shipping.json")}
                style={{ width: 200, height: 200 }}
              />
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backBtn: {
    width: 45,
    height: 45,
    backgroundColor: "#FFF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  map: {
    width: width,
    height: height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  shipperMarker: {
    width: 35,
    height: 35,
    backgroundColor: "#FF7622",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    height: 450,
  },
  dragArea: {
    width: "100%",
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#E3E4E8",
    borderRadius: 3,
  },
  sheetContent: {
    padding: 24,
    paddingTop: 0,
  },
  timeText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#181C2E",
    textAlign: "center",
  },
  estimatedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A0A5BA",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 1,
  },
  arrivingSoonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF7622",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  arrivedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#32CD32", // Màu xanh lá biểu thị hoàn thành
    textAlign: "center",
    marginBottom: 20,
  },
  lottieWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
});
