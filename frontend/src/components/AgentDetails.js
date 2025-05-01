import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function AgentDetails({ open, handleClose, agent, onUpdate }) {
    const [content, setContent] = useState('');
    const [urls, setUrls] = useState(agent?.urls.join('\n') || '');
    const [name, setName] = useState(agent?.name || '');
    const [loading, setLoading] = useState(false);

    const fetchContent = async () => {
        if (agent?.id && open) {
            try {
                const response = await axios.get(`${API_BASE_URL}/get_stored_file/${agent.id}`, {
                    headers: {
                        'Authorization': `Basic ${btoa(`${localStorage.getItem('username')}:${localStorage.getItem('password')}`)}`,
                    },
                });
                setContent(response.data);
            } catch (error) {
                console.error('Error fetching content:', error);
                setContent('Error loading content.');
            }
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const parsedUrls = urls.split('\n').map(url => url.trim()).filter(url => url !== '');
            const response = await axios.put(
                `${API_BASE_URL}/api/agents/${agent?.id}`,
                { name, urls: parsedUrls },
                {
                    headers: {
                        'Authorization': `Basic ${btoa(`${localStorage.getItem('username')}:${localStorage.getItem('password')}`)}`,
                    },
                }
            );
            onUpdate();
            handleClose();
        } catch (error) {
            console.error('Error updating agent:', error);
            // Handle error state appropriately
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [open, agent?.id]);

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>{name}</DialogTitle>
            <DialogContent>
                <TextField
                    label="Agent Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                />
                <TextField
                    label="URLs (one per line)"
                    fullWidth
                    multiline
                    rows={4}
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                    margin="normal"
                />
                <Typography variant="h6" mt={2}>Scraped Content:</Typography>
                <Box sx={{ border: '1px solid #ccc', p: 2, mt: 1, borderRadius: 1, overflow: 'auto', maxHeight: 300 }}>
                    <pre>{content}</pre>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Agent'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AgentDetails;
