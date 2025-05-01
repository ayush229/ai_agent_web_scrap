import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateAgent = () => {
  const [name, setName] = useState("");
  const [urls, setUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name.trim() || !urls.trim()) {
      setError("Agent name and at least one URL are required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "/scrape_and_store",
        {
          url: urls
            .split("\n")
            .filter((url) => url.trim())
            .join(","),
          name,
        },
        {
          auth: {
            username: localStorage.getItem("username"),
            password: localStorage.getItem("password"),
          },
        }
      );

      // Save agent to our agents list
      await axios.post(
        "/api/agents",
        {
          id: response.data.unique_code,
          name,
          urls: urls.split("\n").filter((url) => url.trim()),
          createdAt: new Date().toISOString(),
        },
        {
          auth: {
            username: localStorage.getItem("username"),
            password: localStorage.getItem("password"),
          },
        }
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating agent:", err);
      setError(err.response?.data?.error || "Failed to create agent");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New AI Agent
      </Typography>
      <Box sx={{ maxWidth: "800px", mx: "auto" }}>
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
          rows={6}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          margin="normal"
          required
          helperText="Enter one URL per line. The agent will scrape all these URLs."
        />
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Creating Agent..." : "Create Agent"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateAgent;
