import React from "react";
import { useNavigate } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Logout from "@mui/icons-material/Logout";
import Settings from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ExploreIcon from "@mui/icons-material/Explore";
import ApiIcon from "@mui/icons-material/Api";

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const Navbar = ({ setAuthenticated }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [currentTab, setCurrentTab] = React.useState(0);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    switch (newValue) {
      case 0:
        navigate("/dashboard");
        break;
      case 1:
        navigate("/create-agent");
        break;
      case 2:
        navigate("/explore");
        break;
      case 3:
        navigate("/api-details");
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem("authenticated");
    setAuthenticated(false);
    navigate("/");
  };

  // Set active tab based on current route
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/dashboard")) setCurrentTab(0);
    else if (path.startsWith("/create-agent")) setCurrentTab(1);
    else if (path.startsWith("/explore")) setCurrentTab(2);
    else if (path.startsWith("/api-details")) setCurrentTab(3);
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: theme.palette.background.paper }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          sx={{ mr: 2, color: theme.palette.text.primary }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            mr: 4,
            color: theme.palette.text.primary,
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={() => navigate("/dashboard")}
        >
          Web Scraping AI Agent
        </Typography>

        <Box sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              icon={<DashboardIcon />}
              iconPosition="start"
              label="Dashboard"
              sx={{ minHeight: 64 }}
            />
            <Tab
              icon={<AddCircleIcon />}
              iconPosition="start"
              label="Create Agent"
              sx={{ minHeight: 64 }}
            />
            <Tab
              icon={<ExploreIcon />}
              iconPosition="start"
              label="Explore"
              sx={{ minHeight: 64 }}
            />
            <Tab
              icon={<ApiIcon />}
              iconPosition="start"
              label="API Details"
              sx={{ minHeight: 64 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {localStorage.getItem("username")?.charAt(0).toUpperCase() ||
                  "U"}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={() => navigate("/dashboard")}>
            <Avatar /> Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
