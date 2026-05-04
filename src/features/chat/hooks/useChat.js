import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

const getCurrentTime = () =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const generateSessionId = () =>
    'sesi_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);

const BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080'
    : 'http://localhost:8080';

const WELCOME_MESSAGE = {
    id: 'welcome',
    text: 'Halo! Saya asisten belanja TokoKu. Ada yang bisa saya bantu hari ini? 🛒',
    isUser: false,
    timestamp: getCurrentTime(),
};

const createNewSession = () => ({
    id: generateSessionId(),
    title: 'Chat Baru',
    createdAt: new Date().toISOString(),
    messages: [{ ...WELCOME_MESSAGE, id: 'welcome_' + Date.now() }],
});

export const useChat = () => {
    const [initialized] = useState(() => {
        const first = createNewSession();
        return { sessions: [first], activeId: first.id };
    });

    const [sessionList, setSessionList] = useState(initialized.sessions);
    const [currentSessionId, setCurrentSessionId] = useState(initialized.activeId);
    const [isTyping, setIsTyping] = useState(false);

    const activeSession = sessionList.find(s => s.id === currentSessionId);
    const messages = activeSession?.messages ?? [];

    const updateMessages = useCallback((sessionId, updater) => {
        setSessionList(prev =>
            prev.map(s => s.id === sessionId ? { ...s, messages: updater(s.messages) } : s)
        );
    }, []);

    const setSessionTitle = useCallback((sessionId, text) => {
        const title = text.length > 28 ? text.slice(0, 28) + '…' : text;
        setSessionList(prev =>
            prev.map(s => s.id === sessionId ? { ...s, title } : s)
        );
    }, []);

    const callAPI = useCallback(async (sessionId, text) => {
        const response = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, message: text }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.reply;
    }, []);

    const sendMessage = useCallback(async (text) => {
        const sessionId = currentSessionId;
        const session = sessionList.find(s => s.id === sessionId);
        if (!session) return;

        const isFirstUserMsg = !session.messages.some(m => m.isUser);
        if (isFirstUserMsg) setSessionTitle(sessionId, text);

        const userMsg = {
            id: 'u_' + Date.now(),
            text,
            isUser: true,
            timestamp: getCurrentTime(),
        };
        updateMessages(sessionId, prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const reply = await callAPI(sessionId, text);
            updateMessages(sessionId, prev => [...prev, {
                id: 'b_' + Date.now(),
                text: reply,
                isUser: false,
                timestamp: getCurrentTime(),
            }]);
        } catch (e) {
            console.error(e);
            updateMessages(sessionId, prev => [...prev, {
                id: 'err_' + Date.now(),
                text: 'Maaf, terjadi gangguan koneksi ke server. Silakan coba lagi.',
                isUser: false,
                timestamp: getCurrentTime(),
            }]);
        } finally {
            setIsTyping(false);
        }
    }, [currentSessionId, sessionList, updateMessages, setSessionTitle, callAPI]);

    // Edit pesan user → hapus semua setelahnya → kirim ulang
    const editMessage = useCallback(async (messageId, newText) => {
        const sessionId = currentSessionId;
        let truncated = [];

        setSessionList(prev => prev.map(s => {
            if (s.id !== sessionId) return s;
            const idx = s.messages.findIndex(m => m.id === messageId);
            if (idx === -1) return s;
            truncated = s.messages.slice(0, idx);
            return { ...s, messages: truncated };
        }));

        await sendMessage(newText);
    }, [currentSessionId, sendMessage]);

    // Regenerate jawaban bot terakhir
    const regenerateMessage = useCallback(async (messageId) => {
        const sessionId = currentSessionId;
        const session = sessionList.find(s => s.id === sessionId);
        if (!session) return;

        const idx = session.messages.findIndex(m => m.id === messageId);
        if (idx === -1) return;

        // Cari pesan user sebelum bot message ini
        let lastUserMsg = null;
        for (let i = idx - 1; i >= 0; i--) {
            if (session.messages[i].isUser) {
                lastUserMsg = session.messages[i];
                break;
            }
        }
        if (!lastUserMsg) return;

        // Hapus bot message ini
        updateMessages(sessionId, prev => prev.filter((_, i) => i !== idx));
        setIsTyping(true);

        try {
            const reply = await callAPI(sessionId, lastUserMsg.text);
            updateMessages(sessionId, prev => [...prev, {
                id: 'b_' + Date.now(),
                text: reply,
                isUser: false,
                timestamp: getCurrentTime(),
            }]);
        } catch (e) {
            updateMessages(sessionId, prev => [...prev, {
                id: 'err_' + Date.now(),
                text: 'Maaf, gagal membuat ulang jawaban. Silakan coba lagi.',
                isUser: false,
                timestamp: getCurrentTime(),
            }]);
        } finally {
            setIsTyping(false);
        }
    }, [currentSessionId, sessionList, updateMessages, callAPI]);

    const createSession = useCallback(() => {
        const newSesi = createNewSession();
        setSessionList(prev => [newSesi, ...prev]);
        setCurrentSessionId(newSesi.id);
    }, []);

    const switchSession = useCallback((sessionId) => {
        setCurrentSessionId(sessionId);
    }, []);

    const deleteSession = useCallback(async (sessionId) => {
        try {
            await fetch(`${BASE_URL}/api/chat/${sessionId}`, { method: 'DELETE' });
        } catch (e) {
            console.warn('Gagal hapus sesi di server:', e);
        }

        setSessionList(prev => {
            const updated = prev.filter(s => s.id !== sessionId);
            if (updated.length === 0) {
                const fresh = createNewSession();
                setCurrentSessionId(fresh.id);
                return [fresh];
            }
            if (sessionId === currentSessionId) {
                setCurrentSessionId(updated[0].id);
            }
            return updated;
        });
    }, [currentSessionId]);

    return {
        messages,
        isTyping,
        sendMessage,
        editMessage,
        regenerateMessage,
        sessions: sessionList,
        currentSessionId,
        createSession,
        switchSession,
        deleteSession,
    };
};