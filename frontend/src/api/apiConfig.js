export const API_CONFIG = {
    baseURL: 'http://localhost:8080',
    version: 'v1',
    endpoints: {
        auth: {
            login: '/auth/login',
            register: '/auth/register'
        },
        users: {
            profile: '/api/users/{userId}',
            contacts: '/api/users/{userId}/contacts',
            blocked: {
                list: '/api/users/{userId}/blocked',
                block: '/api/users/{userId}/block/{blockedUserId}',
                unblock: '/api/users/{userId}/unblock/{blockedUserId}'
            }
        },
        chats: {
            create: '/api/v1/chats/CreateChat',
            join: '/api/v1/chats/{chatId}/join',
            leave: '/api/v1/chats/{chatId}/leave',
            admin: {
                addMember: '/api/v1/chats/{chatId}/admin/add',
                removeMember: '/api/v1/chats/{chatId}/admin/remove'
            },
            search: '/api/v1/chats/SearchChat',
            myChats: '/api/v1/chats/MyChats',
            delete: '/api/v1/chats/{chatId}'
        },
        messages: {
            send: '/api/messages',
            chat: '/api/messages/chat/{chatId}',
            unseen: '/api/messages/unseen/{chatId}',
            search: '/api/messages/search',
            markSeen: '/api/messages/{messageId}/seen',
            markDelivered: '/api/messages/{messageId}/delivered',
            edit: '/api/messages/{messageId}',
            delete: '/api/messages/{messageId}',
            media: {
                uploadUrl: '/api/messages/media/upload-url',
                download: '/api/messages/media/{messageId}',
                delete: '/api/messages/media/{messageId}'
            }
        }
    }
};

export const API_VERSION = API_CONFIG.version;

// Swagger API documentation URLs
export const SWAGGER_URL = 'http://localhost:8080/v3/api-docs';
export const SWAGGER_UI_URL = 'http://localhost:8080/swagger-ui.html';
