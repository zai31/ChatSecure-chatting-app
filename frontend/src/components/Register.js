import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';

function Register() {
    const { keycloak } = useKeycloak();

    useEffect(() => {
        // Redirect to Keycloak registration page immediately
        if (keycloak && keycloak.authenticated === false) {
            // Use the register method with action=register to go directly to registration page
            keycloak.register({ redirectUri: window.location.origin });
        }
    }, [keycloak]);

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
            }}
        >
            <CircularProgress />
            <Box sx={{ ml: 2 }}>Redirecting to registration page...</Box>
        </Box>
    );
}

export default Register;
