import React, { useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Modal,
    SafeAreaView, FlatList, Platform, Animated, Dimensions
} from 'react-native';
import { colors } from '../../../styles/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.8;

export const HistoryPanel = ({ visible, sessions, currentSessionId, onSelect, onCreate, onDelete, onClose }) => {
    const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 14, useNativeDriver: true }),
                Animated.timing(backdropAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: PANEL_WIDTH, duration: 250, useNativeDriver: true }),
                Animated.timing(backdropAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMins = Math.floor((now - date) / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} mnt lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        return `${diffDays} hari lalu`;
    };

    const renderSession = ({ item, index }) => {
        const isActive = item.id === currentSessionId;
        const lastMsg = item.messages[item.messages.length - 1];
        const preview = lastMsg?.text?.slice(0, 48) || 'Belum ada pesan';
        const isBot = !lastMsg?.isUser;

        return (
            <TouchableOpacity
                style={[styles.sessionItem, isActive && styles.sessionItemActive]}
                onPress={() => { onSelect(item.id); onClose(); }}
                activeOpacity={0.7}
            >
                <View style={[styles.sessionIndex, isActive && styles.sessionIndexActive]}>
                    <Text style={[styles.sessionIndexText, isActive && styles.sessionIndexTextActive]}>
                        {index + 1}
                    </Text>
                </View>
                <View style={styles.sessionContent}>
                    <View style={styles.sessionHeader}>
                        <Text style={[styles.sessionTitle, isActive && styles.sessionTitleActive]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={styles.sessionTime}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.sessionPreview} numberOfLines={1}>
                        {isBot ? '🤖 ' : '👤 '}{preview}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDelete(item.id)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    if (!visible && slideAnim._value === PANEL_WIDTH) return null;

    return (
        <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
                </Animated.View>

                <Animated.View style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}>
                    <SafeAreaView style={{ flex: 1 }}>
                        {/* Header */}
                        <View style={styles.panelHeader}>
                            <View>
                                <Text style={styles.panelTitle}>Riwayat Chat</Text>
                                <Text style={styles.panelSubtitle}>{sessions.length} percakapan</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* New Chat Button */}
                        <TouchableOpacity
                            style={styles.newChatBtn}
                            onPress={() => { onCreate(); onClose(); }}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.newChatBtnText}>＋  Chat Baru</Text>
                        </TouchableOpacity>

                        {/* Session List */}
                        {sessions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>💬</Text>
                                <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
                                <Text style={styles.emptyDesc}>Mulai chat baru untuk memulai percakapan</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={sessions}
                                keyExtractor={item => item.id}
                                renderItem={renderSession}
                                contentContainerStyle={styles.sessionList}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(13, 27, 62, 0.5)',
    },
    panel: {
        width: PANEL_WIDTH,
        backgroundColor: colors.surface,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: -8, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 20,
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 36 : 16,
        paddingBottom: 16,
        backgroundColor: colors.primary,
    },
    panelTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    panelSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    newChatBtn: {
        marginHorizontal: 16,
        marginVertical: 14,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: colors.primarySurface,
        borderWidth: 1.5,
        borderColor: colors.primary,
        alignItems: 'center',
    },
    newChatBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: 0.3,
    },
    sessionList: {
        paddingHorizontal: 12,
        paddingBottom: 30,
    },
    sessionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 14,
        marginBottom: 6,
        gap: 10,
        backgroundColor: colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
    },
    sessionItemActive: {
        backgroundColor: colors.primarySurface,
        borderColor: colors.primary,
        borderWidth: 1.5,
    },
    sessionIndex: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: colors.surfaceContainerHigh,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sessionIndexActive: {
        backgroundColor: colors.primary,
    },
    sessionIndexText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.onSurfaceVariant,
    },
    sessionIndexTextActive: {
        color: '#FFFFFF',
    },
    sessionContent: {
        flex: 1,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
    },
    sessionTitle: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: colors.onSurface,
        marginRight: 6,
    },
    sessionTitleActive: {
        color: colors.primary,
    },
    sessionTime: {
        fontSize: 10,
        color: colors.onSurfaceVariant,
    },
    sessionPreview: {
        fontSize: 12,
        color: colors.onSurfaceVariant,
        lineHeight: 17,
    },
    deleteBtn: {
        padding: 4,
    },
    deleteBtnText: {
        fontSize: 14,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 60,
    },
    emptyIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.onSurface,
    },
    emptyDesc: {
        fontSize: 13,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 19,
    },
});