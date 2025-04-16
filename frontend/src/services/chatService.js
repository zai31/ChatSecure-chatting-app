import axios from 'axios';
import { API_CONFIG, API_VERSION } from '../api/apiConfig';
import { useKeycloak } from '@react-keycloak/web';

export class ChatService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: `${API_CONFIG.baseURL}/${API_VERSION}`,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add a request interceptor to include the authorization token
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const { keycloak } = useKeycloak();
                if (keycloak && keycloak.token) {
                    config.headers.Authorization = `Bearer ${keycloak.token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    // Chat operations
    async sendMessage(message) {
        try {
            const response = await this.axiosInstance.post(API_CONFIG.endpoints.messages.send, message);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    async sendMediaMessage(message, file) {
        try {
            // First get the S3 upload URL from the backend
            const uploadUrlResponse = await this.axiosInstance.post(
                API_CONFIG.endpoints.messages.media.uploadUrl,
                {
                    chatId: message.chatId,
                    senderId: message.senderId,
                    mimeType: file.type,
                    fileName: file.name
                }
            );

            // Upload the file to S3
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await axios.put(
                uploadUrlResponse.data.uploadUrl,
                formData,
                {
                    headers: {
                        'Content-Type': file.type
                    }
                }
            );

            // Create the message with the S3 URL
            const messageWithMedia = {
                ...message,
                fileUrl: uploadUrlResponse.data.fileUrl
            };

            // Send the message with the S3 URL
            const response = await this.axiosInstance.post(
                API_CONFIG.endpoints.messages.send,
                messageWithMedia
            );

            return response.data;
        } catch (error) {
            throw new Error(`Failed to send media message: ${error.message}`);
        }
    }

    async getChatMessages(chatId) {
        try {
            const response = await this.axiosInstance.get(API_CONFIG.endpoints.messages.chat.replace('{chatId}', chatId));
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get chat messages: ${error.message}`);
        }
    }

    async getUnseenMessages(chatId) {
        try {
            const response = await this.axiosInstance.get(API_CONFIG.endpoints.messages.unseen.replace('{chatId}', chatId));
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get unseen messages: ${error.message}`);
        }
    }

    async searchMessages(query) {
        try {
            const response = await this.axiosInstance.get(API_CONFIG.endpoints.messages.search, {
                params: { request: query }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to search messages: ${error.message}`);
        }
    }

    async markMessageAsSeen(messageId) {
        try {
            const response = await this.axiosInstance.put(API_CONFIG.endpoints.messages.markSeen.replace('{messageId}', messageId));
            return response.data;
        } catch (error) {
            throw new Error(`Failed to mark message as seen: ${error.message}`);
        }
    }

    async markMessageAsDelivered(messageId) {
        try {
            const response = await this.axiosInstance.put(API_CONFIG.endpoints.messages.markDelivered.replace('{messageId}', messageId));
            return response.data;
        } catch (error) {
            throw new Error(`Failed to mark message as delivered: ${error.message}`);
        }
    }

    async editMessage(messageId, updatedMessage) {
        try {
            const response = await this.axiosInstance.put(
                API_CONFIG.endpoints.messages.edit.replace('{messageId}', messageId),
                updatedMessage
            );
            return response.data;
        } catch (error) {
            throw new Error(`Failed to edit message: ${error.message}`);
        }
    }

    async deleteMessage(messageId) {
        try {
            const response = await this.axiosInstance.delete(API_CONFIG.endpoints.messages.delete.replace('{messageId}', messageId));
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete message: ${error.message}`);
        }
    }

    async downloadMedia(messageId) {
        try {
            const response = await this.axiosInstance.get(
                API_CONFIG.endpoints.messages.media.download.replace('{messageId}', messageId),
                { responseType: 'blob' }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Failed to download media: ${error.message}`);
        }
    }

    async deleteMedia(messageId) {
        try {
            const response = await this.axiosInstance.delete(API_CONFIG.endpoints.messages.media.delete.replace('{messageId}', messageId));
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete media: ${error.message}`);
        }
    }

    // Chat management
    async createChat(name, members) {
        try {
            const response = await this.axiosInstance.post(API_CONFIG.endpoints.chats.create, members, {
                params: { name, chatId: members[0] }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create chat: ${error.message}`);
        }
    }

    async joinChat(chatId, userId) {
        try {
            const response = await this.axiosInstance.post(API_CONFIG.endpoints.chats.join.replace('{chatId}', chatId), {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to join chat: ${error.message}`);
        }
    }

    async leaveChat(chatId, userId) {
        try {
            const response = await this.axiosInstance.post(API_CONFIG.endpoints.chats.leave.replace('{chatId}', chatId), {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to leave chat: ${error.message}`);
        }
    }

    async getMyChats() {
        try {
            const response = await this.axiosInstance.get(API_CONFIG.endpoints.chats.myChats);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get chats: ${error.message}`);
        }
    }

    async searchChat(name) {
        try {
            const response = await this.axiosInstance.get(API_CONFIG.endpoints.chats.search, {
                params: { ChatName: name }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to search chat: ${error.message}`);
        }
    }

    async deleteChat(chatId, userId) {
        try {
            const response = await this.axiosInstance.delete(API_CONFIG.endpoints.chats.delete.replace('{chatId}', chatId), {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete chat: ${error.message}`);
        }
    }

    // User operations
    async getUserProfile(userId) {
        try {
            const response = await this.axiosInstance.get(API_CONFIG.endpoints.users.profile.replace('{userId}', userId));
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get user profile: ${error.message}`);
        }
    }

    async getContacts(userId) {
        try {
            const response = await this.axiosInstance.get(API_CONFIG.endpoints.users.contacts.replace('{userId}', userId));
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get contacts: ${error.message}`);
        }
    }

    async getBlockedUsers(userId) {
        try {
            const response = await this.axiosInstance.get(API_CONFIG.endpoints.users.blocked.list.replace('{userId}', userId));
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get blocked users: ${error.message}`);
        }
    }

    async blockUser(userId, blockedUserId) {
        try {
            const response = await this.axiosInstance.post(
                API_CONFIG.endpoints.users.blocked.block
                    .replace('{userId}', userId)
                    .replace('{blockedUserId}', blockedUserId)
            );
            return response.data;
        } catch (error) {
            throw new Error(`Failed to block user: ${error.message}`);
        }
    }

    async unblockUser(userId, blockedUserId) {
        try {
            const response = await this.axiosInstance.post(
                API_CONFIG.endpoints.users.blocked.unblock
                    .replace('{userId}', userId)
                    .replace('{blockedUserId}', blockedUserId)
            );
            return response.data;
        } catch (error) {
            throw new Error(`Failed to unblock user: ${error.message}`);
        }
    }
}

// Export a singleton instance
export const chatService = new ChatService();
