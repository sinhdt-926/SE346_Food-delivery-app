import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerTabs from './CustomerTabs';

import PersonalInfoScreen from '../screens/customer/PersonalInfoScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';
import FoodDetailScreen from '../screens/customer/FoodDetailScreen';
import MyAddressScreen from '../screens/customer/MyAddressScreen';
import AddLocationScreen from '../screens/customer/AddLocationScreen';

export type CustomerStackParamList = {
    CustomerTabs: undefined;
    PersonalInfo: undefined;
    EditProfile: undefined;
    FoodDetail: { id: number };
    MyAddress: undefined;
    AddLocation: { editData: any | null };
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export default function CustomerStack() {
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
        </Stack.Navigator>
    );
}