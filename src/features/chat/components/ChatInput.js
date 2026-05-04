import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { colors } from '../../../styles/colors';

export const ChatInput = ({ onSend }) => {
    const [message, setMessage] = useState('');
    const sendScale = useRef(new Animated.Value(1)).current;

    const animateSend = () => {
        Animated.sequence([
            Animated.spring(sendScale, { toValue: 0.85, tension: 200, friction: 5, useNativeDriver: true }),
            Animated.spring(sendScale, { toValue: 1, tension: 200, friction: 5, useNativeDriver: true }),
        ]).start();
    };

    const handleSend = () => {
        if (message.trim()) {
            animateSend();
            onSend(message.trim());
            setMessage('');
        }
    };

    const hasText = message.trim().length > 0;

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Tanya sesuatu tentang produk..."
                placeholderTextColor={colors.outline}
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                multiline
                maxHeight={100}
            />
            <Animated.View style={{ transform: [{ scale: sendScale }] }}>
                <TouchableOpacity
                    style={[styles.sendButton, !hasText && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!hasText}
                    activeOpacity={0.8}
                >
                    <Text style={styles.sendIcon}>➤</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 20,
        paddingHorizontal: 6,
        paddingVertical: 6,
        marginHorizontal: 16,
        borderWidth: 1.5,
        borderColor: colors.outlineVariant,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    input: {
        flex: 1,
        minHeight: 40,
        paddingHorizontal: 14,
        paddingVertical: 8,
        fontSize: 15,
        color: colors.onSurface,
        lineHeight: 21,
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
    sendButtonDisabled: {
        backgroundColor: colors.surfaceContainerHigh,
        shadowOpacity: 0,
        elevation: 0,
    },
    sendIcon: {
        color: '#FFFFFF',
        fontSize: 16,
        transform: [{ rotate: '-45deg' }],
        marginLeft: 2,
        marginBottom: 2,
    },
});