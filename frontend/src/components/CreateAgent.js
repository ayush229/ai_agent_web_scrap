import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function CreateAgent() {
    const [name, setName] = useState('');
    const [urls, setUrls] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!name.trim() || !urls.trim()) {
            setError('Please provide both agent name and URLs.');
            return;
        }
        setError('');
        setLoading(true);
        const urlList = urls.split('\n').map(url => url.trim()).filter(url => url !== '');

        try {
            const scrapeResponse = await axios.post(
                `${API_BASE_URL}/scrape_and_store`,
                { urls: urlList.join(','), agent_name: name },
                {
                    headers: {
                        'Authorization': `Basic ${btoa(`${localStorage.getItem('username')}:${localStorage.getItem('password')}`)}`,
                    },
                }
            );

            if (scrapeResponse.data && scrapeResponse.data.unique_code) {
                const agentData = {
                    unique_code: scrapeResponse.data.unique_code,
                    name: name,
                    urls: urlList,
                    created_at: new Date().toISOString(), // Or get from backend if provided
                };
                await axios.post(
                    `${API_BASE_URL}/api/agents`,
                    agentData,
                    {
                        headers: {
                            'Authorization': `Basic ${btoa(`${localStorage.getItem('username')}:${localStorage.getItem('password')}`)}`,
                    },
                    }
                );
                navigate('/dashboard');
            } else {
                setError('Failed to create agent: No unique code received.');
            }
        } catch (err) {
            console.error('Error creating agent:', err);
            setError('Failed to create agent. Please check the URLs and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Create New AI Agent</Typography>
            <Box maxWidth={500}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Agent Name"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        margin="normal"
                        required
                    />
                    <TextField
                        label="URLs to Scrape (one per line)"
                        fullWidth
                        multiline
                        rows={4}
                        value={urls}
                        onChange={(e) => setUrls(e.target.value)}
                        margin="normal"
                        required
                        helperText="Enter one URL per line."
                    />
                    {error && (
                        <Typography color="error" mt={2}>{error}</Typography>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                        sx={{ mt: 2 }}
                    >
                        Create Agent
                    </Button>
                </form>
            </Box>
        </Box>
    );
}

export default CreateAgent;
