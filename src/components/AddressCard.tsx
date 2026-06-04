import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserAddress } from '../services/address.service';

interface AddressCardProps {
    item: UserAddress;
    onSelect: (item: UserAddress) => void;
    onEdit: (item: UserAddress) => void;
    onDelete: (item: UserAddress) => void;
}

// Dùng type any cho iconName để tránh lỗi TS import path
const LABEL_ICON_NAMES: Record<string, any> = {
    'Nhà': 'home-outline',
    'Cơ quan': 'business-outline',
    'Khác': 'location-outline',
};

const LABEL_COLORS: Record<string, string> = {
    'Nhà': '#008BEA',
    'Cơ quan': '#219653',
    'Khác': '#FF7622',
};

export default function AddressCard({ item, onSelect, onEdit, onDelete }: AddressCardProps) {
    const iconName = LABEL_ICON_NAMES[item.label] ?? 'location-outline';
    const color = LABEL_COLORS[item.label] ?? '#FF7622';
    return (
        <TouchableOpacity
            style={[styles.card, item.is_default && styles.cardSelected]}
            onPress={() => onSelect(item)}
            activeOpacity={0.75}
        >
            {/* Icon */}
            <View style={styles.iconBox}>
                <Ionicons
                    name={iconName}
                    size={24}
                    color={color}
                />
            </View>

            {/* Thông tin địa chỉ */}
            <View style={styles.textSection}>
                <View style={styles.topRow}>
                    <View style={styles.labelWrapper}>
                        <Text style={styles.labelText}>
                            {item.label}
                        </Text>
                        {item.is_default && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>Mặc định</Text>
                            </View>
                        )}
                    </View>

                    {/* Nút Sửa & Xóa nằm bên phải của hàng trên cùng */}
                    <View style={styles.actionGroup}>
                        <TouchableOpacity
                            onPress={() => onEdit(item)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
                        >
                            <Ionicons name="create-outline" size={20} color="#FF7622" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onDelete(item)}
                            hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
                        >
                            <Ionicons name="trash-outline" size={20} color="#FF7622" />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.addressText} numberOfLines={2}>
                    {item.address}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#F0F5FA',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
        alignItems: 'flex-start',
    },
    cardSelected: {
        borderColor: '#FF7622',
        backgroundColor: '#FFF8F4',
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textSection: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    labelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#32343E',
        letterSpacing: 0.5,
    },
    defaultBadge: {
        backgroundColor: '#FFE8D9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    defaultBadgeText: {
        fontSize: 9,
        color: '#FF7622',
        fontWeight: 'bold',
    },
    addressText: {
        fontSize: 13,
        color: '#8A8E9B',
        lineHeight: 20,
    },
    actionGroup: {
        flexDirection: 'row',
        gap: 12,
    },
});
