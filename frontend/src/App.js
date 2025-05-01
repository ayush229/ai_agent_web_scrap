import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CreateAgent from "./components/CreateAgent";
import ExploreScrape from "./components/ExploreScrape";
import Navbar from "./components/Navbar";
import ApiDetails from "./components/ApiDetails";

function App() {
  const [authenticated, setAuthenticated] = React.useState(
    localStorage.getItem("authenticated") === "true"
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {authenticated && <Navbar setAuthenticated={setAuthenticated} />}
        <Routes>
          <Route
            path="/"
            element={
              authenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login setAuthenticated={setAuthenticated} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={authenticated ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/create-agent"
            element={authenticated ? <CreateAgent /> : <Navigate to="/" />}
          />
          <Route
            path="/explore"
            element={authenticated ? <ExploreScrape /> : <Navigate to="/" />}
          />
          <Route
            path="/api-details"
            element={authenticated ? <ApiDetails /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
