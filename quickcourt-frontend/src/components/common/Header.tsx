import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  SportsTennis,
  Login,
  PersonAdd,
  Dashboard,
  BookOnline,
  Person,
  Logout,
  Home,
} from '@mui/icons-material';

interface HeaderProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    avatar?: string;
    role: 'user' | 'facility_owner' | 'admin';
  };
  onLogin?: () => void;
  onSignUp?: () => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated = false,
  user,
  onLogin,
  onSignUp,
  onLogout,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleNavigationClick = (path: string) => {
    // If trying to access venues and not authenticated, redirect to login
    if (path === '/venues' && !isAuthenticated) {
      onLogin?.();
      return;
    }
    navigate(path);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const navigationItems = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: 'Book Venues', icon: <BookOnline />, path: '/venues' },
  ];

  const userMenuItems = [
    { label: 'Dashboard', icon: <Dashboard />, action: () => console.log('Dashboard') },
    { label: 'My Bookings', icon: <BookOnline />, action: () => console.log('My Bookings') },
    { label: 'Profile', icon: <Person />, action: () => console.log('Profile') },
    { label: 'Logout', icon: <Logout />, action: onLogout },
  ];

  const renderMobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={handleMobileDrawerToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          QUICKCOURT
        </Typography>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem 
            key={item.label} 
            onClick={() => { 
              handleNavigationClick(item.path); 
              handleMobileDrawerToggle(); 
            }} 
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        {!isAuthenticated && (
          <>
            <ListItem onClick={() => { onLogin?.(); handleMobileDrawerToggle(); }} sx={{ cursor: 'pointer' }}>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <Login />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem onClick={() => { onSignUp?.(); handleMobileDrawerToggle(); }} sx={{ cursor: 'pointer' }}>
              <ListItemIcon sx={{ color: 'secondary.main' }}>
                <PersonAdd />
              </ListItemIcon>
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <SportsTennis sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              QUICKCOURT
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 3 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigationClick(item.path)}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Authentication Buttons */}
          {!isAuthenticated ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isMobile && (
                <>
                  <Button
                    color="inherit"
                    startIcon={<Login />}
                    onClick={onLogin}
                    sx={{ color: 'text.primary' }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={onSignUp}
                    sx={{
                      bgcolor: 'secondary.main',
                      '&:hover': {
                        bgcolor: 'secondary.dark',
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0 }}
                aria-label="account menu"
              >
                <Avatar
                  alt={user?.name}
                  src={user?.avatar}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                    {user?.role?.replace('_', ' ')}
                  </Typography>
                </Box>
                {userMenuItems.map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => {
                      item.action?.();
                      handleProfileMenuClose();
                    }}
                    sx={{
                      gap: 2,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      },
                    }}
                  >
                    {item.icon}
                    <Typography variant="body2">{item.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {renderMobileDrawer()}
    </>
  );
};

export default Header;
