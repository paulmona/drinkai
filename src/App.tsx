import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Container,
  Divider,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LocalBar as BarIcon,
  Liquor as LiquorIcon,
} from '@mui/icons-material';
import Inventory from './components/Inventory';
import DrinkGenerator, { getCachedSuggestions } from './components/DrinkGenerator';
import Logo from './components/Logo';
import { loadInventory } from './utils/inventoryManager';

const drawerWidth = 240;

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'inventory' | 'generator'>('inventory');

  // Check inventory and cache on startup
  useEffect(() => {
    const inventory = loadInventory();
    const cachedSuggestions = getCachedSuggestions();

    if (inventory.length === 0) {
      // If no inventory, start on inventory page
      setCurrentPage('inventory');
    } else if (cachedSuggestions) {
      // If inventory exists and cache exists, start on generator page
      setCurrentPage('generator');
    } else {
      // If inventory exists but no cache, start on generator page
      // The DrinkGenerator component will automatically generate new suggestions
      setCurrentPage('generator');
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setCurrentPage('inventory')}>
            <ListItemIcon>
              <LiquorIcon />
            </ListItemIcon>
            <ListItemText primary="My Inventory" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setCurrentPage('generator')}>
            <ListItemIcon>
              <BarIcon />
            </ListItemIcon>
            <ListItemText primary="Generate Drink" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Logo />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {currentPage === 'inventory' && <Inventory />}
        {currentPage === 'generator' && <DrinkGenerator />}
      </Box>
    </Box>
  );
}
