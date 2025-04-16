import { useKeycloak } from '@react-keycloak/web';
import { useEffect, useState } from 'react';
import { API_CONFIG } from '../api/apiConfig';
import { v4 as uuidv4 } from 'uuid';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.callbacks = new Map();
        this.connected = false;
        this.reconnectAttempts = 0;
        this.MAX_RECONNECT_ATTEMPTS = 5;
        this.RECONNECT_DELAY = 5000; // 5 seconds
    }

    connect = () => {
        const { keycloak } = useKeycloak();
        if (!keycloak || !keycloak.token) {
            console.error('No authentication token available');
            return;
        }

        const wsUrl = `${API_CONFIG.baseURL.replace('http', 'ws')}/ws`;
        console.log('Connecting to WebSocket:', wsUrl);

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.connected = true;
            this.reconnectAttempts = 0;
            
            // Send authentication token
            this.socket.send(JSON.stringify({
                type: 'AUTHENTICATE',
                token: keycloak.token
            }));
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);

            // Call appropriate callback
            if (this.callbacks.has(message.type)) {
                this.callbacks.get(message.type)(message.data);
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.connected = false;
            
            // Attempt to reconnect if not reached max attempts
            if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
                this.reconnectAttempts++;
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
                setTimeout(() => this.connect(), this.RECONNECT_DELAY);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    disconnect = () => {
        if (this.socket) {
            this.socket.close();
            this.connected = false;
        }
    }

    subscribe = (type, callback) => {
        this.callbacks.set(type, callback);
    }

    unsubscribe = (type) => {
        this.callbacks.delete(type);
    }

    sendMessage = (type, data) => {
        if (!this.connected) {
            console.error('WebSocket not connected');
            return;
        }

        const message = {
            id: uuidv4(),
            type,
            data
        };

        this.socket.send(JSON.stringify(message));
    }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();
