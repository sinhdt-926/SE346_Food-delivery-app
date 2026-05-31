import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface FormInputProps extends TextInputProps {
    label: string;
    error?: string;
}

export default function FormInput({ label, error, style, ...props }: FormInputProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, error ? styles.inputError : null, style]}
                placeholderTextColor="#BDBDBD"
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 18, width: '100%' },
    label: { fontSize: 14, fontWeight: '500', color: '#828282', marginBottom: 8 },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1E1E1E',
        backgroundColor: '#FAFAFA',
    },
    inputError: { borderColor: '#EB5757' },
    errorText: { fontSize: 12, color: '#EB5757', marginTop: 4, marginLeft: 4 },
});