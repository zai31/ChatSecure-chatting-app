import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const { keycloak, initialized } = useKeycloak();

    useEffect(() => {
        // If already authenticated, redirect to chats
        if (initialized && keycloak.authenticated) {
            navigate('/chats');
        }
        // Otherwise, redirect to Keycloak login page
        else if (initialized && !keycloak.authenticated) {
            keycloak.login({ redirectUri: window.location.origin + '/chats' });
        }
    }, [keycloak, initialized, navigate]);

    // Show loading spinner while waiting for initialization or redirection
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
            <Box sx={{ ml: 2 }}>Redirecting to login page...</Box>
        </Box>
    );
}

export default Login;