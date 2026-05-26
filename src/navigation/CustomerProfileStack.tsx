import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerTabs from './CustomerTabs';

import PersonalInfoScreen from '../screens/customer/PersonalInfoScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';

export type CustomerProfileStackParamList = {
    CustomerTabs: undefined;
    PersonalInfo: undefined;
    EditProfile: undefined;
};

const Stack = createNativeStackNavigator<CustomerProfileStackParamList>();

export default function CustomerProfileStack() {
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
        </Stack.Navigator>
    );
}