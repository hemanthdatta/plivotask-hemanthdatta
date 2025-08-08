import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
} from '@mui/material';
import {
  SmartToy,
  AccountCircle,
  Logout,
  Dashboard,
  RecordVoiceOver,
  Image,
  Summarize,
} from '@mui/icons-material';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Dashboard sx={{ mr: 0.5 }} /> },
    { path: '/conversation', label: 'Conversation', icon: <RecordVoiceOver sx={{ mr: 0.5 }} /> },
    { path: '/image', label: 'Image', icon: <Image sx={{ mr: 0.5 }} /> },
    { path: '/summarize', label: 'Summarize', icon: <Summarize sx={{ mr: 0.5 }} /> },
  ];

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)' }}>
      <Toolbar>
        <SmartToy sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 0, mr: 4, fontWeight: 'bold' }}>
          AI Playground
        </Typography>
        
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{
                opacity: location.pathname === item.path ? 1 : 0.8,
                borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                borderRadius: 0,
                '&:hover': {
                  opacity: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.username}
          </Typography>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
