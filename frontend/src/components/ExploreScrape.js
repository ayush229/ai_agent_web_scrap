import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import axios from "axios";

const ExploreScrape = () => {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("beautify");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await axios.get("/scrape", {
        params: { url, type },
        auth: {
          username: localStorage.getItem("username"),
          password: localStorage.getItem("password"),
        },
      });
      setResponse(result.data);
    } catch (err) {
      console.error("Error scraping:", err);
      setError(err.response?.data?.error || "Failed to scrape website");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Explore & Scrape
      </Typography>
      <Box sx={{ maxWidth: "800px", mx: "auto" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Website URL"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            margin="normal"
          />
          <FormControl sx={{ minWidth: 150 }} margin="normal">
            <InputLabel>Scrape Type</InputLabel>
            <Select
              value={type}
              label="Scrape Type"
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="raw">Raw HTML</MenuItem>
              <MenuItem value="beautify">Beautified Content</MenuItem>
              <MenuItem value="ai">AI Processed</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleScrape}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Scraping..." : "Scrape Website"}
          </Button>
        </Box>

        {response && (
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Scraping Results
            </Typography>
            <Box
              sx={{
                p: 2,
                border: "1px solid #ddd",
                borderRadius: 1,
                maxHeight: "400px",
                overflow: "auto",
              }}
            >
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ExploreScrape;
