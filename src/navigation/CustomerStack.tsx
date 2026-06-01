import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerTabs from './CustomerTabs';

import PersonalInfoScreen from '../screens/customer/PersonalInfoScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';
import FoodDetailScreen from '../screens/customer/FoodDetailScreen';
import MyAddressScreen from '../screens/customer/MyAddressScreen';
import AddLocationScreen from '../screens/customer/AddLocationScreen';
import CategoryFoodScreen from '../screens/customer/CategoryFoodScreen';
import SearchFoodScreen from '../screens/customer/SearchFoodScreen';

export type CustomerStackParamList = {
    CustomerTabs: undefined;
    PersonalInfo: undefined;
    EditProfile: undefined;
    FoodDetail: { id: number };
    MyAddress: undefined;
    AddLocation: { editData: any | null };
    CategoryFood: { category_id: number | null; category_name: string };
    SearchFood: undefined;
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
            <Stack.Screen name="CategoryFood" component={CategoryFoodScreen} />
            <Stack.Screen name="SearchFood" component={SearchFoodScreen} />
        </Stack.Navigator>
    );
}