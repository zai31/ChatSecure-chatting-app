import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { useKeycloak } from '@react-keycloak/web';

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { keycloak } = useKeycloak();

    // Load initial data
    const loadInitialData = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);

            // Load contacts
            const contactsData = await chatService.getContacts(userId);
            setContacts(contactsData);

            // Load blocked users
            const blockedData = await chatService.getBlockedUsers(userId);
            setBlockedUsers(blockedData);

            // Load recent messages (if any)
            const chatMessages = await chatService.getMyChats();
            if (chatMessages && chatMessages.length > 0) {
                const recentMessages = await chatService.getChatMessages(chatMessages[0].id);
                setMessages(recentMessages);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Send message
    const sendMessage = useCallback(async (message) => {
        try {
            const sentMessage = await chatService.sendMessage(message);
            setMessages(prev => [...prev, sentMessage]);
            return sentMessage;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Send media message
    const sendMediaMessage = useCallback(async (message, file) => {
        try {
            const sentMessage = await chatService.sendMediaMessage(message, file);
            setMessages(prev => [...prev, sentMessage]);
            return sentMessage;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Message management
    const markMessageAsSeen = useCallback(async (messageId) => {
        try {
            await chatService.markMessageAsSeen(messageId);
            const updatedMessages = messages.map(msg => 
                msg.id === messageId ? { ...msg, messageState: 'READ' } : msg
            );
            setMessages(updatedMessages);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [messages]);

    const markMessageAsDelivered = useCallback(async (messageId) => {
        try {
            await chatService.markMessageAsDelivered(messageId);
            const updatedMessages = messages.map(msg => 
                msg.id === messageId ? { ...msg, messageState: 'DELIVERED' } : msg
            );
            setMessages(updatedMessages);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [messages]);

    const editMessage = useCallback(async (messageId, updatedMessage) => {
        try {
            const editedMessage = await chatService.editMessage(messageId, updatedMessage);
            const updatedMessages = messages.map(msg => 
                msg.id === messageId ? { ...msg, ...editedMessage } : msg
            );
            setMessages(updatedMessages);
            return editedMessage;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [messages]);

    const deleteMessage = useCallback(async (messageId) => {
        try {
            await chatService.deleteMessage(messageId);
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Chat management
    const createChat = useCallback(async (name, members) => {
        try {
            const chat = await chatService.createChat(name, members);
            return chat;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const joinChat = useCallback(async (chatId, userId) => {
        try {
            await chatService.joinChat(chatId, userId);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const leaveChat = useCallback(async (chatId, userId) => {
        try {
            await chatService.leaveChat(chatId, userId);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const getMyChats = useCallback(async () => {
        try {
            const chats = await chatService.getMyChats();
            return chats;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const searchChat = useCallback(async (name) => {
        try {
            const chats = await chatService.searchChat(name);
            return chats;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteChat = useCallback(async (chatId, userId) => {
        try {
            await chatService.deleteChat(chatId, userId);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // User operations
    const getUserProfile = useCallback(async (userId) => {
        try {
            const profile = await chatService.getUserProfile(userId);
            return profile;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const getContacts = useCallback(async (userId) => {
        try {
            const contacts = await chatService.getContacts(userId);
            setContacts(contacts);
            return contacts;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const getBlockedUsers = useCallback(async (userId) => {
        try {
            const blocked = await chatService.getBlockedUsers(userId);
            setBlockedUsers(blocked);
            return blocked;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const blockUser = useCallback(async (blockedUserId) => {
        try {
            await chatService.blockUser(keycloak.tokenParsed.sub, blockedUserId);
            const updatedBlockedUsers = await chatService.getBlockedUsers(keycloak.tokenParsed.sub);
            setBlockedUsers(updatedBlockedUsers);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [keycloak]);

    const unblockUser = useCallback(async (blockedUserId) => {
        try {
            await chatService.unblockUser(keycloak.tokenParsed.sub, blockedUserId);
            const updatedBlockedUsers = await chatService.getBlockedUsers(keycloak.tokenParsed.sub);
            setBlockedUsers(updatedBlockedUsers);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [keycloak]);

    return {
        messages,
        contacts,
        blockedUsers,
        loading,
        error,
        loadInitialData,
        sendMessage,
        sendMediaMessage,
        markMessageAsSeen,
        markMessageAsDelivered,
        editMessage,
        deleteMessage,
        createChat,
        joinChat,
        leaveChat,
        getMyChats,
        searchChat,
        deleteChat,
        getUserProfile,
        getContacts,
        getBlockedUsers,
        blockUser,
        unblockUser,
    };
}
