import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';
import App from './App';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8080';

const keycloakConfig = {
    url: 'http://localhost:9090',
    realm: 'whatsapp-clone',
    clientId: 'whatsapp-clone-app',
    redirectUri: window.location.origin,
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256',
    checkLoginIframe: false,
    enableLogging: true
};

const keycloak = new Keycloak(keycloakConfig);

const renderError = (error) => {
    // Ensure error is an object
    const errorObj = error || {};
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
        <div style={{
            padding: '20px',
            fontFamily: 'Arial',
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center'
        }}>
            <h1 style={{ color: '#d32f2f' }}>Authentication Service Unavailable</h1>
            <p>We're unable to connect to the authentication service.</p>

            <div style={{
                backgroundColor: '#ffebee',
                padding: '20px',
                borderRadius: '8px',
                margin: '20px 0',
                textAlign: 'left'
            }}>
                <h3>Error Details:</h3>
                <p><strong>Message:</strong> {errorObj.message || 'Unknown error'}</p>
                <p><strong>Details:</strong> {errorObj.details || 'No details available'}</p>
                <p><strong>Keycloak URL:</strong> {errorObj.config?.url || keycloakConfig.url}</p>
            </div>

            <div style={{
                marginTop: '30px'
            }}>
                <p>Please try again later or contact support if the problem persists.</p>
                <button 
                    onClick={() => window.location.reload()} 
                    style={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        marginTop: '10px'
                    }}
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );
};

const initApp = () => {
    try {
        // Clear any stale tokens
        try {
            localStorage.clear();
            sessionStorage.clear();
            console.log('Cleared local and session storage');
        } catch (storageError) {
            console.warn('Failed to clear storage:', storageError);
        }

        // Set up axios interceptors to handle token refresh
        axios.interceptors.request.use(
            async (config) => {
                if (keycloak.authenticated) {
                    try {
                        // Only refresh token if it's close to expiration
                        const tokenExpired = keycloak.isTokenExpired(30); // 30 seconds buffer
                        if (tokenExpired) {
                            console.log('Token expired or about to expire, refreshing...');
                            await keycloak.updateToken(70);
                        }
                        
                        // Add the token to the request
                        const token = keycloak.token;
                        if (token) {
                            config.headers.Authorization = `Bearer ${token}`;
                        }
                    } catch (error) {
                        console.error('Failed to refresh token:', error);
                    }
                }
                return config;
            },
            (error) => {
                console.error('Axios request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for 401 errors
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response && error.response.status === 401 && keycloak.authenticated) {
                    console.log('Received 401 response, refreshing token...');
                    try {
                        await keycloak.updateToken(70);
                        // Retry the request with the new token
                        const originalRequest = error.config;
                        originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        console.error('Token refresh failed after 401:', refreshError);
                        // Redirect to login if refresh fails
                        keycloak.login();
                    }
                }
                return Promise.reject(error);
            }
        );

        // Render app with Keycloak provider
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
            <ReactKeycloakProvider 
                authClient={keycloak}
                initOptions={{ 
                    onLoad: 'check-sso',  
                    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                    pkceMethod: 'S256',
                    checkLoginIframe: false,
                    enableLogging: true
                }}
                onEvent={(event, error) => {
                    console.log('Keycloak event:', event, error || '');
                    if (event === 'onAuthError' || event === 'onAuthLogout') {
                        console.error('Authentication error or logout:', error);
                    }
                }}
                loadingComponent={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        fontSize: '20px'
                    }}>
                        Loading authentication...
                    </div>
                }
            >
                <App />
            </ReactKeycloakProvider>
        );
    } catch (error) {
        console.error('Failed to initialize app:', error);
        renderError(error);
    }
};

// Start the app
initApp();