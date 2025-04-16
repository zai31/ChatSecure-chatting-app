import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import Login from './components/Login';
import Register from './components/Register';
import ChatLayout from './components/ChatLayout';
import Welcome from './components/Welcome';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#f50057',
        },
    },
});

// Loading component
const LoadingComponent = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Box sx={{ ml: 2 }}>Loading...</Box>
    </Box>
);

// Protected route component
function ProtectedRoute({ children }) {
    const { keycloak, initialized } = useKeycloak();
    
    if (!initialized) {
        return <LoadingComponent />;
    }
    
    return keycloak.authenticated ? children : <Navigate to="/welcome" replace />;
}

function App() {
    const { keycloak, initialized } = useKeycloak();

    // Show loading while Keycloak is initializing
    if (!initialized) {
        return <LoadingComponent />;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/welcome" element={<Welcome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/chats"
                        element={
                            <ProtectedRoute>
                                <ChatLayout />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/welcome" replace />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;