import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../../styles/colors';

export const TypingIndicator = () => {
    const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();

        dots.forEach((dot, i) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 180),
                    Animated.timing(dot, { toValue: -6, duration: 280, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
                    Animated.delay(600 - i * 180),
                ])
            ).start();
        });
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🤖</Text>
            </View>
            <View style={styles.bubble}>
                <View style={styles.dotsContainer}>
                    {dots.map((dot, i) => (
                        <Animated.View
                            key={i}
                            style={[styles.dot, { transform: [{ translateY: dot }] }]}
                        />
                    ))}
                </View>
                <Text style={styles.label}>Sedang menjawab...</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 6,
        gap: 8,
    },
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.primarySurface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    botAvatarText: {
        fontSize: 16,
    },
    bubble: {
        backgroundColor: colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        height: 20,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.primary,
        opacity: 0.8,
    },
    label: {
        fontSize: 12,
        color: colors.onSurfaceVariant,
        fontStyle: 'italic',
    },
});