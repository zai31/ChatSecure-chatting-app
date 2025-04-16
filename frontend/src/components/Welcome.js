import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

function Welcome() {
    const handleLogin = () => {
        // Direct redirect to Keycloak login using window.location
        window.location.href = 'http://localhost:9090/realms/whatsapp-clone/protocol/openid-connect/auth?client_id=whatsapp-clone-app&redirect_uri=' + 
            encodeURIComponent(window.location.origin + '/chats') + 
            '&response_type=code&scope=openid';
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0a2463 0%, #1e88e5 100%)',
                padding: 3
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: { xs: 3, sm: 5 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: 500,
                    width: '100%',
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
            >
                <Box 
                    sx={{ 
                        mb: 4, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center' 
                    }}
                >
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        align="center" 
                        sx={{ 
                            fontWeight: 700, 
                            mb: 1, 
                            color: '#0a2463',
                            letterSpacing: '-0.5px'
                        }}
                    >
                        ChatSecure
                    </Typography>
                    
                    <Typography 
                        variant="subtitle1" 
                        align="center" 
                        sx={{ 
                            color: '#546e7a',
                            fontWeight: 500
                        }}
                    >
                        Secure messaging made simple
                    </Typography>
                </Box>
                
                <Box 
                    component="img"
                    src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png"
                    alt="Secure messaging"
                    sx={{ 
                        width: 120, 
                        height: 120, 
                        mb: 4,
                        opacity: 0.9
                    }}
                />
                
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleLogin}
                    sx={{
                        py: 1.5,
                        px: 5,
                        fontSize: '1rem',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        backgroundColor: '#1976d2',
                        '&:hover': {
                            backgroundColor: '#0d47a1'
                        },
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        width: { xs: '100%', sm: 'auto' }
                    }}
                >
                    Sign In
                </Button>
                
                <Typography 
                    variant="body2" 
                    align="center" 
                    sx={{ 
                        mt: 4, 
                        color: '#78909c',
                        fontSize: '0.875rem'
                    }}
                >
                    Protected with Keycloak authentication
                </Typography>
            </Paper>
        </Box>
    );
}

export default Welcome;
