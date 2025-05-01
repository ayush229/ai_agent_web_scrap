import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import axios from "axios";

const AgentDetails = ({ open, handleClose, agent, onUpdate }) => {
  const [content, setContent] = useState("");
  const [urls, setUrls] = useState(agent.urls.join("\n"));
  const [name, setName] = useState(agent.name);
  const [loading, setLoading] = useState(false);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/get_stored_file/${agent.id}`, {
        auth: {
          username: localStorage.getItem("username"),
          password: localStorage.getItem("password"),
        },
      });
      setContent(response.data.content);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put(
        `/api/agents/${agent.id}`,
        {
          urls: urls.split("\n").filter((url) => url.trim()),
          name,
        },
        {
          auth: {
            username: localStorage.getItem("username"),
            password: localStorage.getItem("password"),
          },
        }
      );
      onUpdate();
      handleClose();
    } catch (error) {
      console.error("Error updating agent:", error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (open) {
      fetchContent();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Agent Details: {agent.name}</DialogTitle>
      <DialogContent dividers>
        <Box mb={3}>
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
        </Box>
        <Typography variant="h6" gutterBottom>
          Scraped Content:
        </Typography>
        <Box
          sx={{
            p: 2,
            border: "1px solid #ddd",
            borderRadius: 1,
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {content}
          </pre>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleUpdate}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Agent"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgentDetails;
