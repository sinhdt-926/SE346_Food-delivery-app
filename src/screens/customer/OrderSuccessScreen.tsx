import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import CustomButton from '../../components/CustomButton';

export default function OrderSuccessScreen({ navigation, route }: any) {
  const { orderId } = route.params;
  const animation = useRef<LottieView>(null);

  // Chặn nút back cứng của Android để người dùng không quay lại màn hình Checkout
  useEffect(() => {
    const backAction = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'CustomerTabs' }],
      });
      return true; // Chặn hành vi mặc định
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CustomerTabs' }],
    });
  };

  const handleViewOrder = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'CustomerTabs', params: { screen: 'Orders' } }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Lottie Animation */}
        <View style={styles.animationContainer}>
          <LottieView
            autoPlay
            loop={false}
            ref={animation}
            style={styles.lottie}
            source={require('../../../assets/lottie/success.json')}
          />
        </View>

        <Text style={styles.title}>Tuyệt vời!</Text>
        <Text style={styles.subtitle}>
          Đơn hàng của bạn đã được đặt thành công.
        </Text>
        <Text style={styles.description}>
          Nhà hàng đang chuẩn bị món ăn. Tài xế sẽ sớm mang đến cho bạn.
        </Text>
      </View>

      <View style={styles.footer}>
        <CustomButton
          title="THEO DÕI ĐƠN HÀNG"
          onPress={handleViewOrder}
          buttonStyle={styles.primaryBtn}
        />
        <CustomButton
          title="VỀ TRANG CHỦ"
          onPress={handleGoHome}
          buttonStyle={styles.secondaryBtn}
          textStyle={styles.secondaryBtnText}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181C2E',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#32343E',
    textAlign: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    color: '#FF7622',
  },
  description: {
    fontSize: 14,
    color: '#A0A5BA',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    gap: 12,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 16,
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F0F5FA',
    elevation: 0,
    shadowOpacity: 0,
  },
  secondaryBtnText: {
    color: '#32343E',
  },
});
