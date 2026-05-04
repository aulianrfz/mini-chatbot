import React, { useRef, useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { AppBar } from '../shared/components/AppBar';
import { ChatBubble } from '../features/chat/components/ChatBubble';
import { TypingIndicator } from '../features/chat/components/TypingIndicator';
import { SuggestionChips } from '../features/chat/components/SuggestionChips';
import { ChatInput } from '../features/chat/components/ChatInput';
import { HistoryPanel } from '../features/chat/components/HistoryPanel';
import { useChat } from '../features/chat/hooks/useChat';
import { colors } from '../styles/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SUGGESTIONS = [
    'Cek harga produk',
    'Status pengiriman',
    'Promo hari ini',
    'Cara retur barang',
    'Rekomendasi produk',
];

export const ChatScreen = () => {
    const insets = useSafeAreaInsets();
    const {
        messages, isTyping,
        sendMessage, editMessage, regenerateMessage,
        sessions, currentSessionId,
        createSession, switchSession, deleteSession,
    } = useChat();

    const flatListRef = useRef(null);
    const [historyVisible, setHistoryVisible] = useState(false);

    const activeSession = sessions.find(s => s.id === currentSessionId);

    const renderMessage = ({ item }) => (
        <ChatBubble
            message={item.text}
            isUser={item.isUser}
            timestamp={item.timestamp}
            messageId={item.id}
            onEdit={editMessage}
            onRegenerate={regenerateMessage}
        />
    );

    return (
        <View style={styles.container}>
            <AppBar
                onHistoryPress={() => setHistoryVisible(true)}
                sessionTitle={activeSession?.title ?? 'Chat Baru'}
            />

            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListFooterComponent={isTyping ? <TypingIndicator /> : null}
                    showsVerticalScrollIndicator={false}
                />

                 <View style={[
                    styles.bottomContainer,
                    { paddingBottom: insets.bottom + 10 } // ← ganti hardcode dengan insets
                ]}>
                    <SuggestionChips suggestions={SUGGESTIONS} onSelect={sendMessage} />
                    <ChatInput onSend={sendMessage} />
                </View>
            </KeyboardAvoidingView>

            <HistoryPanel
                visible={historyVisible}
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelect={switchSession}
                onCreate={createSession}
                onDelete={deleteSession}
                onClose={() => setHistoryVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardAvoid: {
        flex: 1,
    },
    listContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    bottomContainer: {
        paddingBottom: Platform.OS === 'ios' ? 28 : 20,
        paddingTop: 10,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.outlineVariant,
    },
});