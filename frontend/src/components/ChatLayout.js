import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, TextField, List, ListItem, ListItemText, IconButton, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Grid } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';
import { useChat } from '../hooks/useChat';
import { useParams } from 'react-router-dom';

function ChatLayout() {
    //hooks
    const { keycloak } = useKeycloak();
    const { chatId } = useParams();
    const { 
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
        getMyChats,
        searchChat,
        createChat,
        joinChat,
        leaveChat,
        blockUser,
        unblockUser
    } = useChat();
//state variables
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);

    useEffect(() => {
        if (keycloak && keycloak.token) {
            const userId = keycloak.tokenParsed.sub;
            loadInitialData(userId);
            getMyChats().then(chats => {
                if (chats.length > 0) {
                    setSelectedChat(chats[0]);
                }
            });
        }
    }, [keycloak, loadInitialData, getMyChats]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (selectedChat && newMessage.trim()) {
            const message = {
                chatId: selectedChat.id,
                senderId: keycloak.tokenParsed.sub,
                messageType: 'TEXT',
                textContent: newMessage.trim()
            };
            await sendMessage(message);
            setNewMessage('');
        }
    };

    const handleSendMedia = async (e) => {
        const file = e.target.files[0];
        if (file && selectedChat) {
            const message = {
                chatId: selectedChat.id,
                senderId: keycloak.tokenParsed.sub,
                messageType: 'MEDIA',
                mimeType: file.type
            };
            await sendMediaMessage(message, file);
            setMediaFile(null);
        }
    };

    const handleEditMessage = async (messageId) => {
        const message = messages.find(msg => msg.id === messageId);
        if (message) {
            setEditingMessage(message);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            await deleteMessage(messageId);
        }
    };

    const handleCreateChat = async () => {
        const name = prompt('Enter chat name:');
        if (name) {
            await createChat(name, [keycloak.tokenParsed.sub]);
            const chats = await getMyChats();
            setSelectedChat(chats[0]);
        }
    };

    const handleSearchChat = async () => {
        const name = prompt('Search for chat:');
        if (name) {
            const chats = await searchChat(name);
            if (chats.length > 0) {
                setSelectedChat(chats[0]);
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Chat List Sidebar */}
            <Paper elevation={3} sx={{ width: 300, flexShrink: 0 }}>
                <Box sx={{ p: 2 }}>
                    <Button variant="outlined" onClick={handleCreateChat}>
                        Create Chat
                    </Button>
                    <Button variant="outlined" onClick={handleSearchChat} sx={{ ml: 1 }}>
                        Search Chat
                    </Button>
                </Box>
                <Typography variant="h6" sx={{ p: 2 }}>
                    Chats
                </Typography>
                <List>
                    {contacts.map((contact) => (
                        <ListItem
                            key={contact.id}
                            button
                            onClick={() => setSelectedChat(contact)}
                            sx={{
                                bgcolor: contact.id === selectedChat?.id ? 'action.selected' : 'transparent',
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            <Avatar>{contact.firstName[0]}</Avatar>
                            <ListItemText
                                primary={contact.firstName}
                                secondary={contact.status}
                            />
                            {blockedUsers.includes(contact.id) ? (
                                <IconButton onClick={() => unblockUser(contact.id)}>
                                    Unblock
                                </IconButton>
                            ) : (
                                <IconButton onClick={() => blockUser(contact.id)}>
                                    Block
                                </IconButton>
                            )}
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Chat Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Messages List */}
                <Paper elevation={3} sx={{ flex: 1, overflowY: 'auto' }}>
                    {messages.map((message) => (
                        <Box
                            key={message.id}
                            sx={{
                                p: 2,
                                mb: 1,
                                alignSelf: message.senderId === keycloak.tokenParsed.sub ? 'flex-end' : 'flex-start',
                                bgcolor: message.senderId === keycloak.tokenParsed.sub ? 'primary.main' : 'background.paper',
                                color: message.senderId === keycloak.tokenParsed.sub ? 'white' : 'text.primary',
                                borderRadius: 2,
                                maxWidth: '70%',
                            }}
                        >
                            {message.messageType === 'TEXT' ? (
                                <Typography variant="body1">
                                    {message.textContent}
                                </Typography>
                            ) : (
                                <Box sx={{ width: '100%', maxWidth: 300 }}>
                                    {message.fileUrl && (
                                        <img
                                            src={message.fileUrl}
                                            alt="Message media"
                                            style={{ width: '100%', borderRadius: 4 }}
                                        />
                                    )}
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(message.createdDate).toLocaleTimeString()}
                                </Typography>
                                <Box>
                                    {message.messageState === 'SENT' && (
                                        <Typography variant="caption" color="text.secondary">
                                            Sent
                                        </Typography>
                                    )}
                                    {message.messageState === 'DELIVERED' && (
                                        <Typography variant="caption" color="primary">
                                            Delivered
                                        </Typography>
                                    )}
                                    {message.messageState === 'READ' && (
                                        <Typography variant="caption" color="success.main">
                                            Read
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            {message.senderId === keycloak.tokenParsed.sub && (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    {editingMessage?.id === message.id ? (
                                        <TextField
                                            fullWidth
                                            value={editingMessage.textContent}
                                            onChange={(e) => {
                                                setEditingMessage({
                                                    ...editingMessage,
                                                    textContent: e.target.value
                                                });
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    editMessage(message.id, editingMessage);
                                                    setEditingMessage(null);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <IconButton
                                                onClick={() => handleEditMessage(message.id)}
                                                size="small"
                                            >
                                                Edit
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDeleteMessage(message.id)}
                                                size="small"
                                            >
                                                Delete
                                            </IconButton>
                                        </>
                                    )}
                                </Box>
                            )}
                        </Box>
                    ))}
                </Paper>

                {/* Message Input Area */}
                <Paper elevation={3} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <input
                            type="file"
                            accept="image/*,video/*,audio/*"
                            onChange={handleSendMedia}
                            style={{ display: 'none' }}
                            id="mediaInput"
                        />
                        <label htmlFor="mediaInput">
                            <Button variant="outlined" component="span">
                                Send Media
                            </Button>
                        </label>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            onClick={handleSendMessage}
                        >
                            Send
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

export default ChatLayout;