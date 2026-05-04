import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, Animated, Pressable
} from 'react-native';
import { colors } from '../../../styles/colors';

export const ChatBubble = ({ message, isUser, timestamp, onEdit, onRegenerate, messageId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message);
    const [showActions, setShowActions] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const actionFade = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const toggleActions = () => {
        const toValue = showActions ? 0 : 1;
        setShowActions(!showActions);
        Animated.spring(actionFade, {
            toValue,
            tension: 120,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const handleSaveEdit = () => {
        if (editText.trim() && editText.trim() !== message) {
            onEdit?.(messageId, editText.trim());
        }
        setIsEditing(false);
        setShowActions(false);
    };

    const handleCancelEdit = () => {
        setEditText(message);
        setIsEditing(false);
    };

    return (
        <Animated.View
            style={[
                styles.container,
                isUser ? styles.userContainer : styles.botContainer,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
        >
            {!isUser && (
                <View style={styles.botAvatar}>
                    <Text style={styles.botAvatarText}>🤖</Text>
                </View>
            )}

            <View style={styles.bubbleWrapper}>
                <Pressable onLongPress={toggleActions} delayLongPress={400}>
                    <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
                        {isEditing ? (
                            <View>
                                <TextInput
                                    style={[styles.editInput, { color: colors.onSurface }]}
                                    value={editText}
                                    onChangeText={setEditText}
                                    multiline
                                    autoFocus
                                />
                                <View style={styles.editActions}>
                                    <TouchableOpacity style={styles.editSaveBtn} onPress={handleSaveEdit}>
                                        <Text style={styles.editSaveBtnText}>Simpan & Kirim</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.editCancelBtn} onPress={handleCancelEdit}>
                                        <Text style={styles.editCancelBtnText}>Batal</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>
                                {message}
                            </Text>
                        )}
                    </View>
                </Pressable>

                {/* Action buttons (muncul saat long press) */}
                {showActions && !isEditing && (
                    <Animated.View
                        style={[
                            styles.actionRow,
                            isUser ? styles.actionRowUser : styles.actionRowBot,
                            { opacity: actionFade, transform: [{ scale: actionFade }] }
                        ]}
                    >
                        {isUser && (
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => { setIsEditing(true); }}
                            >
                                <Text style={styles.actionBtnIcon}>✏️</Text>
                                <Text style={styles.actionBtnText}>Edit</Text>
                            </TouchableOpacity>
                        )}
                        {!isUser && (
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => { onRegenerate?.(messageId); setShowActions(false); }}
                            >
                                <Text style={styles.actionBtnIcon}>🔄</Text>
                                <Text style={styles.actionBtnText}>Buat Ulang</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.actionBtn} onPress={toggleActions}>
                            <Text style={styles.actionBtnIcon}>✕</Text>
                            <Text style={styles.actionBtnText}>Tutup</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampBot]}>
                    {timestamp}
                </Text>
            </View>

            {isUser && (
                <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>👤</Text>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 6,
        alignItems: 'flex-end',
        gap: 8,
    },
    userContainer: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
        maxWidth: '88%',
    },
    botContainer: {
        alignSelf: 'flex-start',
        maxWidth: '88%',
    },
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.primarySurface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    botAvatarText: {
        fontSize: 16,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    userAvatarText: {
        fontSize: 16,
    },
    bubbleWrapper: {
        flex: 1,
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        marginBottom: 2,
    },
    userBubble: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: colors.surfaceContainerLowest,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#FFFFFF',
    },
    botText: {
        color: colors.onSurface,
    },
    timestamp: {
        fontSize: 11,
        paddingHorizontal: 4,
    },
    timestampUser: {
        color: colors.onSurfaceVariant,
        textAlign: 'right',
    },
    timestampBot: {
        color: colors.onSurfaceVariant,
        textAlign: 'left',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 4,
        marginTop: 2,
    },
    actionRowUser: {
        justifyContent: 'flex-end',
    },
    actionRowBot: {
        justifyContent: 'flex-start',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.surfaceContainerHighest,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
    },
    actionBtnIcon: {
        fontSize: 12,
    },
    actionBtnText: {
        fontSize: 11,
        color: colors.onSurfaceVariant,
        fontWeight: '500',
    },
    editInput: {
        fontSize: 15,
        lineHeight: 22,
        minHeight: 44,
        paddingVertical: 2,
    },
    editActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    editSaveBtn: {
        flex: 1,
        backgroundColor: colors.primarySurface,
        paddingVertical: 6,
        borderRadius: 10,
        alignItems: 'center',
    },
    editSaveBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
    },
    editCancelBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: colors.surfaceContainerHigh,
        alignItems: 'center',
    },
    editCancelBtnText: {
        fontSize: 12,
        color: colors.onSurfaceVariant,
    },
});