import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    description: string | React.ReactNode;
    cancelText?: string;
    confirmText?: string;
    onCancel: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export default function ConfirmModal({
    visible,
    title,
    description,
    cancelText = 'Huỷ',
    confirmText = 'Xác nhận',
    onCancel,
    onConfirm,
    isLoading = false
}: ConfirmModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalDesc}>{description}</Text>
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            onPress={onCancel}
                            disabled={isLoading}
                        >
                            <Text style={styles.modalCancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.modalConfirmBtn, isLoading && {opacity: 0.7}]} 
                            onPress={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.modalConfirmText}>{confirmText}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
        padding: 24,
        zIndex: 1000,
    },
    modalBox: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 360,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#32343E', marginBottom: 12 },
    modalDesc: { fontSize: 14, color: '#646982', lineHeight: 22, marginBottom: 24 },
    modalActions: { flexDirection: 'row', gap: 12 },
    modalCancelBtn: {
        flex: 1, height: 48, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E0E0E0',
    },
    modalCancelText: { fontSize: 15, fontWeight: '600', color: '#646982' },
    modalConfirmBtn: {
        flex: 1, height: 48, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#FF7622',
    },
    modalConfirmText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
