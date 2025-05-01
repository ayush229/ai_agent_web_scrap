import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

const AgentQuery = ({ open, handleClose, agentId }) => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await axios.post(
        "/ask_stored",
        {
          unique_code: agentId,
          user_query: query,
        },
        {
          auth: {
            username: localStorage.getItem("username"),
            password: localStorage.getItem("password"),
          },
        }
      );
      setResponse(result.data.ai_response);
    } catch (error) {
      console.error("Error querying agent:", error);
      setResponse("Error: Failed to get response from agent");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Test Agent</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Enter your query"
          fullWidth
          multiline
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          margin="normal"
        />
        <Box mt={2}>
          <Typography variant="h6">Agent Response:</Typography>
          <Box
            sx={{
              p: 2,
              border: "1px solid #ddd",
              borderRadius: 1,
              minHeight: "100px",
              bgcolor: "#f9f9f9",
            }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography>
                {response || "Response will appear here..."}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || !query.trim()}
        >
          Submit Query
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgentQuery;
