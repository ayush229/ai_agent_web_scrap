import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AgentDetails from "./AgentDetails";
import AgentQuery from "./AgentQuery";
import axios from "axios";
import { format } from "date-fns";

const Dashboard = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openQuery, setOpenQuery] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get("/api/agents", {
        auth: {
          username: localStorage.getItem("username"),
          password: localStorage.getItem("password"),
        },
      });
      setAgents(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setLoading(false);
    }
  };

  const columns = [
    { field: "name", headerName: "Agent Name", width: 200 },
    { field: "id", headerName: "Agent ID", width: 300 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      valueFormatter: (params) =>
        format(new Date(params.value), "MMM dd, yyyy HH:mm"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 400,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              setSelectedAgent(params.row);
              setOpenDetails(true);
            }}
            style={{ marginRight: 8 }}
          >
            View Details
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => {
              setSelectedAgent(params.row);
              setOpenQuery(true);
            }}
            style={{ marginRight: 8 }}
          >
            Test Agent
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Box sx={{ height: "calc(100vh - 64px)", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Agents Dashboard
      </Typography>
      <div style={{ height: "70vh", width: "100%" }}>
        <DataGrid
          rows={agents}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10]}
          getRowId={(row) => row.id}
        />
      </div>

      {selectedAgent && (
        <>
          <AgentDetails
            open={openDetails}
            handleClose={() => setOpenDetails(false)}
            agent={selectedAgent}
            onUpdate={fetchAgents}
          />
          <AgentQuery
            open={openQuery}
            handleClose={() => setOpenQuery(false)}
            agentId={selectedAgent.id}
          />
        </>
      )}
    </Box>
  );
};

export default Dashboard;
