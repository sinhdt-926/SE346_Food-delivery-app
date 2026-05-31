import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Switch,
    Alert,
    ActivityIndicator,
    Dimensions,
    ScrollView,
    TextInput,
    FlatList,
    Keyboard,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocationService } from '../../services/location.service';
import { AddressService, UserAddress, AddressPayload } from '../../services/address.service';
import ConfirmModal from '../../components/ConfirmModal';
import CustomButton from '../../components/CustomButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.42;
const DEBOUNCE_MS = 800;

type LabelType = 'Nhà' | 'Cơ quan' | 'Khác';
const LABELS: LabelType[] = ['Nhà', 'Cơ quan', 'Khác'];

interface Props {
    navigation: any;
    route: { params: { editData: UserAddress | null } };
}

export default function AddLocationScreen({ navigation, route }: Props) {
    const insets = useSafeAreaInsets();
    const editData = route?.params?.editData ?? null;
    const mapRef = useRef<MapView>(null);

    const [region, setRegion] = useState<Region>({
        latitude: editData?.latitude ?? 10.8231,
        longitude: editData?.longitude ?? 106.6297,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [resolvedAddress, setResolvedAddress] = useState(editData?.address ?? '');
    const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<LabelType>(
        (editData?.label as LabelType) ?? 'Nhà'
    );
    const [isDefault, setIsDefault] = useState(editData?.is_default ?? false);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchingAPI, setIsSearchingAPI] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const geocodeTimer = useRef<NodeJS.Timeout | null>(null);
    const searchTimer = useRef<NodeJS.Timeout | null>(null);
    const ignoreRegionChange = useRef<boolean>(false);

    // ================== MAP LOGIC ==================
    // Reverse geocode sau khi map đứng yên 800ms
    const handleRegionChangeComplete = useCallback((newRegion: Region) => {
        setRegion(newRegion);

        // Nếu đang ở chế độ Search Overlay thì không tự cập nhật text
        if (isSearching) return;

        // Bỏ qua lần cập nhật nếu được đánh dấu (à dụ: vừa chọn từ danh sách gợi ý)
        if (ignoreRegionChange.current) {
            ignoreRegionChange.current = false;
            return;
        }

        if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
        setIsGeocodingLoading(true);
        geocodeTimer.current = setTimeout(async () => {
            const addr = await LocationService.getAddressFromCoords({
                latitude: newRegion.latitude,
                longitude: newRegion.longitude,
            });
            setResolvedAddress(addr);
            // Xoá text search bar nếu người dùng tự di chuyển map
            setSearchQuery('');
            setIsGeocodingLoading(false);
        }, DEBOUNCE_MS);
    }, [isSearching]);

    // Định vị GPS hiện tại
    const handleLocate = async () => {
        setLocationLoading(true);
        const { coords } = await LocationService.getCurrentLocation();
        const newRegion: Region = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
        mapRef.current?.animateToRegion(newRegion, 600);
        setRegion(newRegion);
        setLocationLoading(false);
    };

    // ================== SEARCH LOGIC ==================
    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        if (searchTimer.current) clearTimeout(searchTimer.current);

        if (text.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        setIsSearchingAPI(true);
        searchTimer.current = setTimeout(async () => {
            const results = await LocationService.searchPlaces(text);
            setSuggestions(results);
            setIsSearchingAPI(false);
        }, 500); // Debounce search 500ms
    };

    const handleSelectSuggestion = (item: any) => {
        Keyboard.dismiss();
        setIsSearching(false);
        // Dùng fullAddress cho cả 2 nơi: search bar và Bottom Sheet
        setSearchQuery(item.fullAddress);
        setResolvedAddress(item.fullAddress);

        // Đánh dấu bỏ qua lần reverse geocode tiếp theo do map tự cuộn
        ignoreRegionChange.current = true;

        const newRegion: Region = {
            latitude: item.lat,
            longitude: item.lon,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
        mapRef.current?.animateToRegion(newRegion, 600);
        setRegion(newRegion);
    };

    // ================== SAVE LOGIC ==================
    const handleSave = () => {
        if (!resolvedAddress || resolvedAddress.startsWith('Toạ độ:')) {
            Alert.alert('Chú ý', 'Vui lòng chọn một vị trí hợp lệ trên bản đồ trước khi lưu.');
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmSave = async () => {
        setShowConfirmModal(false);
        setSaving(true);

        const payload: AddressPayload = {
            label: selectedLabel,
            address: resolvedAddress,
            latitude: region.latitude,
            longitude: region.longitude,
            is_default: isDefault,
        };

        let res;
        if (editData) {
            res = await AddressService.updateAddress(editData.id, payload);
        } else {
            res = await AddressService.addAddress(payload);
        }

        setSaving(false);

        if (res.success) {
            navigation.goBack();
        } else {
            Alert.alert('Lỗi', res.error || 'Không thể lưu địa chỉ. Vui lòng thử lại.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Map full-screen */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                initialRegion={region}
                onRegionChangeComplete={handleRegionChangeComplete}
                showsUserLocation
                showsMyLocationButton={false}
                mapPadding={{ top: 0, right: 0, bottom: BOTTOM_SHEET_HEIGHT, left: 0 }}
            />

            {/* Pin cố định ở giữa màn hình */}
            <View style={styles.pinContainer} pointerEvents="none">
                <Ionicons name="location" size={48} color="#FF7622" />
                <View style={styles.pinShadow} />
            </View>

            {/* ===================== HEADER & SEARCH BAR ===================== */}
            <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => {
                        if (isSearching) {
                            setIsSearching(false);
                            Keyboard.dismiss();
                        } else {
                            navigation.goBack();
                        }
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color="#32343E" />
                </TouchableOpacity>

                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#FF7622" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm địa điểm, đường phố..."
                        placeholderTextColor="#A0A5BA"
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        onFocus={() => setIsSearching(true)}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); }}>
                            <Ionicons name="close-circle" size={18} color="#A0A5BA" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ===================== SEARCH OVERLAY ===================== */}
            {isSearching && (
                <View style={[styles.searchOverlay, { top: insets.top + 70 }]}>
                    {isSearchingAPI ? (
                        <ActivityIndicator style={{ marginTop: 24 }} size="large" color="#FF7622" />
                    ) : (
                        <FlatList
                            data={suggestions}
                            keyExtractor={(_, index) => index.toString()}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ padding: 16 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.suggestionItem}
                                    onPress={() => handleSelectSuggestion(item)}
                                >
                                    <View style={styles.suggestionIconBox}>
                                        <Ionicons name="location-outline" size={20} color="#A0A5BA" />
                                    </View>
                                    <View style={styles.suggestionTexts}>
                                        <Text style={styles.suggestionName} numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                        <Text style={styles.suggestionAddress} numberOfLines={2}>
                                            {item.address}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                searchQuery.length >= 2 ? (
                                    <View style={styles.emptySearch}>
                                        <Ionicons name="search-outline" size={48} color="#E0E0E0" />
                                        <Text style={styles.emptySearchText}>Không tìm thấy kết quả nào</Text>
                                    </View>
                                ) : null
                            }
                        />
                    )}
                </View>
            )}

            {/* Nút Định vị GPS (Ẩn khi đang search) */}
            {!isSearching && (
                <TouchableOpacity
                    style={[styles.locateBtn, { bottom: BOTTOM_SHEET_HEIGHT + 16 }]}
                    onPress={handleLocate}
                    disabled={locationLoading}
                >
                    {locationLoading ? (
                        <ActivityIndicator size="small" color="#FF7622" />
                    ) : (
                        <Ionicons name="locate" size={24} color="#FF7622" />
                    )}
                </TouchableOpacity>
            )}

            {/* ===================== BOTTOM SHEET ===================== */}
            {!isSearching && (
                <View style={[styles.bottomSheet, { height: BOTTOM_SHEET_HEIGHT, paddingBottom: insets.bottom + 8 }]}>
                    {/* Thanh kéo */}
                    <View style={styles.handle} />

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {/* Địa chỉ đang trỏ tới */}
                        <View style={styles.addressRow}>
                            <Ionicons name="location" size={20} color="#FF7622" />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.addressLabel}>Địa chỉ giao hàng</Text>
                                {isGeocodingLoading ? (
                                    <ActivityIndicator size="small" color="#A0A5BA" style={{ alignSelf: 'flex-start', marginTop: 4 }} />
                                ) : (
                                    <Text style={styles.addressValue} numberOfLines={2}>
                                        {resolvedAddress || 'Di chuyển bản đồ để chọn vị trí...'}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Label selector */}
                        <Text style={styles.sectionTitle}>Loại địa chỉ</Text>
                        <View style={styles.labelsRow}>
                            {LABELS.map((key) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[styles.labelChip, selectedLabel === key && styles.labelChipSelected]}
                                    onPress={() => setSelectedLabel(key)}
                                >
                                    <Text style={[styles.labelChipText, selectedLabel === key && styles.labelChipTextSelected]}>
                                        {key}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.divider} />

                        {/* Toggle địa chỉ mặc định */}
                        <View style={styles.toggleRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.toggleLabel}>Đặt làm địa chỉ mặc định</Text>
                                <Text style={styles.toggleSubLabel}>Dùng cho tất cả đơn hàng tiếp theo</Text>
                            </View>
                            <Switch
                                value={isDefault}
                                onValueChange={setIsDefault}
                                trackColor={{ false: '#E0E0E0', true: '#FFBA9C' }}
                                thumbColor={isDefault ? '#FF7622' : '#FFF'}
                            />
                        </View>

                        {/* Nút lưu */}
                        <View style={{ marginTop: 16 }}>
                            <CustomButton
                                title={editData ? 'CẬP NHẬT ĐỊA CHỈ' : 'LƯU ĐỊA CHỈ'}
                                onPress={handleSave}
                                isLoading={saving}
                                buttonStyle={{ height: 52 }}
                            />
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* ===================== MODAL XÁC NHẬN ===================== */}
            <ConfirmModal
                visible={showConfirmModal}
                title={editData ? 'Cập nhật địa chỉ?' : 'Lưu địa chỉ mới?'}
                description={
                    <Text>
                        <Text style={{ fontWeight: '700' }}>{selectedLabel}{'\n'}</Text>
                        {resolvedAddress}
                        {isDefault && '\n\nSẽ được đặt làm địa chỉ giao hàng mặc định.'}
                    </Text>
                }
                onCancel={() => setShowConfirmModal(false)}
                onConfirm={confirmSave}
                isLoading={saving}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },

    // Pin
    pinContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -24,
        marginTop: -(48 + BOTTOM_SHEET_HEIGHT / 2),
        alignItems: 'center',
    },
    pinShadow: {
        width: 12, height: 6,
        borderRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.25)',
        marginTop: -4,
    },

    // Header & Search
    headerContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
        zIndex: 10,
    },
    backBtn: {
        width: 44, height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    searchBar: {
        flex: 1,
        height: 48,
        backgroundColor: '#FFF',
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#32343E',
        height: '100%',
    },

    // Search Overlay
    searchOverlay: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        backgroundColor: '#FFF',
        zIndex: 5,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    suggestionIconBox: {
        width: 36, height: 36,
        borderRadius: 18,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionTexts: {
        flex: 1,
        marginLeft: 12,
    },
    suggestionName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#32343E',
        marginBottom: 4,
    },
    suggestionAddress: {
        fontSize: 13,
        color: '#8A8E9B',
        lineHeight: 18,
    },
    emptySearch: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptySearchText: {
        marginTop: 12,
        fontSize: 15,
        color: '#A0A5BA',
    },

    // Locate Button
    locateBtn: {
        position: 'absolute',
        right: 16,
        width: 50, height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },

    // Bottom Sheet
    bottomSheet: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    handle: {
        width: 40, height: 4,
        borderRadius: 2,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        marginBottom: 16,
    },

    // Address row
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    addressLabel: { fontSize: 11, color: '#A0A5BA', fontWeight: '600', letterSpacing: 0.5 },
    addressValue: { fontSize: 14, color: '#32343E', fontWeight: '600', marginTop: 2, lineHeight: 20 },

    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 14 },

    sectionTitle: { fontSize: 13, color: '#A0A5BA', fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },

    // Labels
    labelsRow: { flexDirection: 'row', gap: 10 },
    labelChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        backgroundColor: '#F8F9FB',
    },
    labelChipSelected: { borderColor: '#FF7622', backgroundColor: '#FFF3EC' },
    labelChipText: { fontSize: 13, fontWeight: '600', color: '#646982' },
    labelChipTextSelected: { color: '#FF7622' },

    // Toggle
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    toggleLabel: { fontSize: 14, fontWeight: '700', color: '#32343E' },
    toggleSubLabel: { fontSize: 12, color: '#A0A5BA', marginTop: 2 },
});
