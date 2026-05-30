import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MenuItemProps {
    iconName: keyof typeof Ionicons.glyphMap;
    label: string;
    subLabel?: string;
    onPress: () => void;
    showChevron?: boolean;
}

export default function MenuItem({
    iconName,
    label,
    subLabel,
    onPress,
    showChevron = true,
}: MenuItemProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.leftSection}>
                <View style={styles.iconWrapper}>
                    <Ionicons name={iconName} size={22} color="#FF8A00" />
                </View>
                <View style={styles.textWrapper}>
                    <Text style={styles.label}>{label}</Text>
                    {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
                </View>
            </View>

            {showChevron && <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
    },
    leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconWrapper: { marginRight: 16 },
    textWrapper: { flex: 1 },
    label: { fontSize: 16, color: '#1E1E1E', fontWeight: '500' },
    subLabel: { fontSize: 13, color: '#828282', marginTop: 4 },
});