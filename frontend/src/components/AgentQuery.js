import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function AgentQuery({ open, handleClose, agentId }) {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setResponse('');
        try {
            const res = await axios.post(
                `${API_BASE_URL}/ask_stored`,
                { unique_code: agentId, query: query },
                {
                    headers: {
                        'Authorization': `Basic ${btoa(`${localStorage.getItem('username')}:${localStorage.getItem('password')}`)}`,
                    },
                }
            );
            setResponse(res.data.reply);
        } catch (error) {
            console.error('Error querying agent:', error);
            setResponse('Error processing your query.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>Test Agent</DialogTitle>
            <DialogContent>
                <TextField
                    label="Your Query"
                    fullWidth
                    multiline
                    rows={4}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    margin="normal"
                />
                <Box mt={2}>
                    <Typography variant="h6">Response:</Typography>
                    <Box sx={{ border: '1px solid #ccc', p: 2, mt: 1, borderRadius: 1, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {loading ? <CircularProgress /> : (response ? <pre>{response}</pre> : <Typography color="textSecondary">No response yet.</Typography>)}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
                <Button onClick={handleSubmit} disabled={loading || !query.trim()}>
                    {loading ? 'Submitting...' : 'Submit Query'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AgentQuery;
