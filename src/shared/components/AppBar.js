import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, Platform, Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { colors } from '../../styles/colors';

export const AppBar = ({ onHistoryPress, sessionTitle = 'Chat Baru' }) => {
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(-20)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 80,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [sessionTitle]);

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.leftContainer}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>🛒</Text>
                    </View>
                    <Animated.View
                        style={[
                            styles.titleContainer,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                        ]}
                    >
                        <Text style={styles.brandName}>TokoKu</Text>
                        <Text style={styles.sessionTitle} numberOfLines={1}>{sessionTitle}</Text>
                    </Animated.View>
                </View>

                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={onHistoryPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.historyIconWrap}>
                        <Text style={styles.historyIcon}>≡</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: colors.primary,
        paddingTop: Platform.OS === 'android' ? 0 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: colors.primary,
        elevation: 8,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 20,
    },
    titleContainer: {
        flex: 1,
        marginRight: 8,
    },
    brandName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    sessionTitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 1,
    },
    historyButton: {
        padding: 4,
    },
    historyIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyIcon: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});