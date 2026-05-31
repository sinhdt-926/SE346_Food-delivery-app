import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AddressCard from '../../components/AddressCard';
import { AddressService, UserAddress } from '../../services/address.service';
import { useAuthStore } from '../../store/useAuthStore';
import ConfirmModal from '../../components/ConfirmModal';
import CustomButton from '../../components/CustomButton';

export default function MyAddressScreen({ navigation }: any) {
    const { fetchUser } = useAuthStore();
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        description: '',
        confirmText: 'Xác nhận',
        onConfirm: async () => {}
    });

    const loadAddresses = useCallback(async () => {
        setLoading(true);
        const res = await AddressService.getAddresses();
        if (res.success) setAddresses(res.data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadAddresses);
        return unsubscribe;
    }, [navigation, loadAddresses]);

    // Chọn địa chỉ mặc định
    const handleSelect = (item: UserAddress) => {
        if (item.is_default) return;

        setModalConfig({
            title: 'Đặt địa chỉ mặc định',
            description: `Bạn có muốn đặt địa chỉ "${item.label}" làm địa chỉ giao hàng mặc định không?`,
            confirmText: 'Đặt mặc định',
            onConfirm: async () => {
                setModalVisible(false);
                setActionLoading(true);
                const res = await AddressService.setDefaultAddress(item.id);
                if (res.success) {
                    await loadAddresses();
                    await fetchUser();
                } else {
                    Alert.alert('Lỗi', res.error || 'Không thể cập nhật địa chỉ mặc định');
                }
                setActionLoading(false);
            }
        });
        setModalVisible(true);
    };

    // Sửa địa chỉ
    const handleEdit = (item: UserAddress) => {
        navigation.navigate('AddLocation', { editData: item });
    };

    // Xóa địa chỉ
    const handleDelete = (item: UserAddress) => {
        setModalConfig({
            title: 'Xóa địa chỉ',
            description: `Bạn có chắc muốn xóa địa chỉ "${item.label}" này không?\nThao tác này không thể hoàn tác.`,
            confirmText: 'Xóa',
            onConfirm: async () => {
                setModalVisible(false);
                setActionLoading(true);
                const res = await AddressService.deleteAddress(item.id);
                if (res.success) {
                    await loadAddresses();
                } else {
                    Alert.alert('Lỗi', res.error || 'Không thể xóa địa chỉ');
                }
                setActionLoading(false);
            }
        });
        setModalVisible(true);
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={styles.emptyTitle}>Chưa có địa chỉ nào</Text>
            <Text style={styles.emptySubtitle}>
                Hãy thêm địa chỉ để trải nghiệm giao hàng nhanh hơn!
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#32343E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Địa chỉ của tôi</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Loading Overlay */}
            {actionLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            )}

            {/* Danh sách địa chỉ */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF7622" />
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <AddressCard
                            item={item}
                            onSelect={handleSelect}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Footer: Nút thêm địa chỉ mới */}
            <View style={styles.footer}>
                <CustomButton 
                    title="Thêm địa chỉ mới"
                    iconName="add-circle-outline"
                    iconColor="#FFF"
                    onPress={() => navigation.navigate('AddLocation', { editData: null })}
                    buttonStyle={{ height: 54 }}
                />
            </View>

            {/* Modal Xác nhận */}
            <ConfirmModal
                visible={modalVisible}
                title={modalConfig.title}
                description={modalConfig.description}
                confirmText={modalConfig.confirmText}
                onCancel={() => setModalVisible(false)}
                onConfirm={modalConfig.onConfirm}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: {
        width: 40, height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#32343E',
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyEmoji: { fontSize: 64, marginBottom: 16 },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#32343E',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#A0A5BA',
        textAlign: 'center',
        paddingHorizontal: 30,
        lineHeight: 20,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99,
    },
    footer: {
        padding: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
});
