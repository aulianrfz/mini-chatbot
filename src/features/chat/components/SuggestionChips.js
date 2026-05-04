import React, { useRef } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import { colors } from '../../../styles/colors';

const AnimatedChip = ({ label, onPress, delay }) => {
    const slideAnim = useRef(new Animated.Value(20)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, delay, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity style={styles.chip} onPress={() => onPress(label)} activeOpacity={0.7}>
                <Text style={styles.chipText}>{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export const SuggestionChips = ({ suggestions, onSelect }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {suggestions.map((s, i) => (
                    <AnimatedChip key={i} label={s} onPress={onSelect} delay={i * 60} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
        paddingVertical: 2,
    },
    chip: {
        backgroundColor: colors.primarySurface,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primaryLight + '60',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },
});