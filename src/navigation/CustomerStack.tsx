import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { subscribeToUserOrders } from '../services/order.service';
import { useAuthStore } from '../store/useAuthStore';
import CustomerTabs from './CustomerTabs';

import PersonalInfoScreen from '../screens/customer/PersonalInfoScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';
import FoodDetailScreen from '../screens/customer/FoodDetailScreen';
import MyAddressScreen from '../screens/customer/MyAddressScreen';
import AddLocationScreen from '../screens/customer/AddLocationScreen';
import CategoryFoodScreen from '../screens/customer/CategoryFoodScreen';
import SearchFoodScreen from '../screens/customer/SearchFoodScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import OrderSuccessScreen from '../screens/customer/OrderSuccessScreen';
import OrderTrackingScreen from '../screens/shared/OrderTrackingScreen';

export type CustomerStackParamList = {
    CustomerTabs: undefined;
    PersonalInfo: undefined;
    EditProfile: undefined;
    FoodDetail: { id: number };
    MyAddress: undefined;
    AddLocation: { editData: any | null };
    CategoryFood: { category_id: number | null; category_name: string };
    SearchFood: undefined;
    Checkout: { checkedItemIds: number[] };
    OrderSuccess: { orderId: number };
    OrderTracking: { orderId: number; role?: string };
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export default function CustomerStack() {
    const navigation = useNavigation<any>();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;

        // Lắng nghe thông qua Service
        const unsubscribe = subscribeToUserOrders(user.id, (payload: any) => {
            const oldStatus = payload?.old?.status;
            const newStatus = payload?.new?.status;

            // Chỉ thông báo nếu trạng thái thực sự thay đổi
            if (oldStatus !== newStatus && newStatus) {
                let title = 'Cập nhật đơn hàng';
                let message = 'Đơn hàng của bạn vừa được cập nhật.';

                if (newStatus === 'preparing') {
                    title = '🧑‍🍳 Quán đã nhận đơn!';
                    message = 'Nhà hàng đang chuẩn bị món ăn cho bạn nhé.';
                } else if (newStatus === 'delivering') {
                    title = '🛵 Shipper đang giao hàng!';
                    message = 'Tài xế đã lấy món và đang trên đường đến chỗ bạn.';
                } else if (newStatus === 'completed') {
                    title = '✅ Giao hàng thành công!';
                    message = 'Đơn hàng của bạn đã được giao. Chúc bạn ngon miệng!';
                } else if (newStatus === 'cancelled') {
                    title = '❌ Đơn hàng bị huỷ';
                    message = 'Rất tiếc, đơn hàng của bạn đã bị huỷ.';
                }

                // Hiện Toast thông báo
                Toast.show({
                    type: 'info',
                    text1: title,
                    text2: message,
                    position: 'top',
                    visibilityTime: 4000,
                    onPress: () => {
                        Toast.hide();
                        navigation.navigate('CustomerTabs', { screen: 'Orders' });
                    },
                });
            }
        });

        return unsubscribe;
    }, [user, navigation]);

    return (
        <Stack.Navigator
            initialRouteName="CustomerTabs"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
            <Stack.Screen name="MyAddress" component={MyAddressScreen} />
            <Stack.Screen
                name="AddLocation"
                component={AddLocationScreen}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="CategoryFood" component={CategoryFoodScreen} />
            <Stack.Screen name="SearchFood" component={SearchFoodScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        </Stack.Navigator>
    );
}