import Keycloak from 'keycloak-js';

window.addEventListener("message", (event) => {
    console.log("\ud83d\udc40 Message received from iframe:", event.data);
});

// Get the current URL as a string
const getCurrentUrl = () => {
    try {
        const url = new URL(window.location.href);
        // Remove any query parameters that might interfere with Keycloak
        url.search = '';
        url.hash = '';
        return url.toString();
    } catch (error) {
        console.error('Failed to parse current URL:', error);
        // Fallback to using origin with path
        const origin = window.location.origin;
        const path = window.location.pathname;
        return `${origin}${path}`;
    }
};


// Ensure URL is a string
const ensureStringUrl = (url) => {
    if (typeof url === 'string') {
        return url;
    }
    if (url instanceof URL) {
        return url.toString();
    }
    if (typeof url === 'object' && url.origin) {
        return `${url.origin}${url.pathname || ''}`;
    }
    console.warn('Invalid URL format:', url);
    return window.location.origin;
};

const keycloakConfig = {
    url: 'http://localhost:9090',
    realm: 'whatsapp-clone',
    clientId: 'whatsapp-clone-app',
    redirectUri: window.location.origin,
    onLoad: 'login-required',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256',
    checkLoginIframe: false,
    enableLogging: true
};

let keycloakInstance = null;
let initializationState = {
    initialized: false,
    inProgress: false,
    error: null
};

const handleInitError = (error, config) => {
    const errorDetails = {
        message: 'Unknown error during Keycloak initialization',
        details: 'No error object was provided',
        config: config
    };

    if (!error) {
        errorDetails.details = 'Initialization failed without error object';
        errorDetails.suggestions = [
            'Check if Keycloak server is running at ' + config.url,
            'Verify that the realm "' + config.realm + '" exists',
            'Ensure the client "' + config.clientId + '" is properly configured',
            'Try clearing browser cookies and local storage'
        ];
        return errorDetails;
    }

    try {
        // Try to get error details from the error object
        errorDetails.message = error.message || error.toString() || 'Unknown error';
        errorDetails.details = error.stack || error.toString();
        errorDetails.code = error.code;
        
        // Check for network errors
        if (error.message && error.message.includes('Failed to fetch')) {
            errorDetails.serverUnavailable = true;
            errorDetails.suggestions = [
                'Make sure the Keycloak server is running at ' + config.url,
                'Check network connectivity',
                'Verify that CORS is properly configured on the Keycloak server',
                'Ensure the realm "' + config.realm + '" exists'
            ];
        }
        
        // Check for nonce errors
        if (error.message && error.message.includes('Invalid nonce')) {
            errorDetails.nonceError = true;
            errorDetails.suggestions = [
                'Clear browser cookies and local storage',
                'Try using a different authentication flow',
                'Check if Keycloak client has "Standard Flow" enabled',
                'Verify that the redirect URI is correctly configured in Keycloak'
            ];
        }
    } catch (e) {
        errorDetails.details = 'Error object could not be processed';
    }

    // Add configuration details
    errorDetails.config = {
        url: ensureStringUrl(config.url),
        realm: config.realm,
        clientId: config.clientId,
        redirectUri: ensureStringUrl(config.redirectUri)
    };

    return errorDetails;
};

const initKeycloak = async (forceLogin = false) => {
    if (initializationState.inProgress) {
        console.warn('Keycloak initialization already in progress');
        return null;
    }
    
    if (initializationState.initialized && keycloakInstance) {
        console.log('Keycloak already initialized');
        return keycloakInstance;
    }
    
    initializationState.inProgress = true;
    initializationState.error = null;
    
    try {
        // Clear any stale tokens from localStorage
        try {
            localStorage.clear();
            sessionStorage.clear();
            console.log('Cleared local and session storage');
        } catch (storageError) {
            console.warn('Failed to clear storage:', storageError);
        }
        
        console.log('Initializing Keycloak with config:', JSON.stringify(keycloakConfig, null, 2));
        
        // Create a new Keycloak instance
        try {
            keycloakInstance = new Keycloak(keycloakConfig);
        } catch (createError) {
            console.error('Failed to create Keycloak instance:', createError);
            throw createError;
        }
        
        if (!keycloakInstance) {
            throw new Error('Failed to create Keycloak instance');
        }
        
        // Add event listeners for debugging
        keycloakInstance.onAuthSuccess = () => {
            console.log('Keycloak: Authentication successful');
        };
        
        keycloakInstance.onAuthError = (errorData) => {
            console.error('Keycloak: Authentication error:', errorData);
        };
        
        keycloakInstance.onTokenExpired = () => {
            console.log('Keycloak: Token expired');
        };
        
        // Ensure all URLs are strings before initialization
        const initOptions = {
            onLoad: forceLogin ? 'login-required' : 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            pkceMethod: 'S256',
            checkLoginIframe: false,
            enableLogging: true
        };
        
        console.log('Calling keycloak.init with options:', JSON.stringify(initOptions, null, 2));
        
        // Initialize Keycloak with a timeout
        const initPromise = keycloakInstance.init(initOptions);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Keycloak initialization timed out after 10 seconds')), 10000);
        });
        
        const authenticated = await Promise.race([initPromise, timeoutPromise]);
        
        console.log('Keycloak initialized successfully. Authenticated:', authenticated);
        initializationState.initialized = true;
        initializationState.error = null;
        return keycloakInstance;
    } catch (error) {
        console.error('Original error object:', error);
        const processedError = handleInitError(error || new Error('Unknown initialization error'), keycloakConfig);
        initializationState.error = processedError;
        initializationState.initialized = false;
        console.error('Keycloak initialization failed:', {
            error: processedError,
            timestamp: new Date().toISOString()
        });
        throw processedError;
    } finally {
        initializationState.inProgress = false;
    }
};

const getKeycloak = () => {
    if (!initializationState.initialized || !keycloakInstance) {
        throw new Error('Keycloak has not been initialized yet');
    }
    return keycloakInstance;
};

const getInitializationState = () => initializationState;

export { initKeycloak, getKeycloak, getInitializationState };
