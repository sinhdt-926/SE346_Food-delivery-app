import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface CustomHeaderProps {
    title: string;
    showBackButton?: boolean;
    rightActionLabel?: string;
    onRightActionPress?: () => void;
}

export default function CustomHeader({
    title,
    showBackButton = true,
    rightActionLabel,
    onRightActionPress,
}: CustomHeaderProps) {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.leftSlot}>
                {showBackButton && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#1E1E1E" />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.title}>{title}</Text>

            <View style={styles.rightSlot}>
                {rightActionLabel && onRightActionPress && (
                    <TouchableOpacity onPress={onRightActionPress}>
                        <Text style={styles.rightLabel}>{rightActionLabel}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    leftSlot: { width: 40, alignItems: 'flex-start' },
    rightSlot: { width: 60, alignItems: 'flex-end' },
    backButton: { padding: 4 },
    title: { fontSize: 18, fontWeight: '600', color: '#1E1E1E' },
    rightLabel: { fontSize: 14, fontWeight: '600', color: '#FF8A00' },
});