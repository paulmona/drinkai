import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Tabs,
  Tab,
  Grid,
  Paper,
  ListItemButton,
  Button,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DrinkItem, drinkItems } from '../data/drinkItems';
import { saveInventory, loadInventory } from '../utils/inventoryManager';
import LocalBar from '@mui/icons-material/LocalBar';
import LocalDrink from '@mui/icons-material/LocalDrink';
import Restaurant from '@mui/icons-material/Restaurant';
import Help from '@mui/icons-material/Help';
import Delete from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Inventory Component
 * Manages the user's drink inventory by allowing them to add/remove items
 * and categorizes them into spirits, mixers, and garnishes.
 */
export default function Inventory() {
  // State management for inventory items
  const [inventory, setInventory] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load inventory from localStorage when component mounts
  useEffect(() => {
    const savedInventory = loadInventory();
    setInventory(savedInventory);
  }, []);

  /**
   * Handles adding a new item to the inventory
   * Validates the input and prevents duplicates
   */
  const handleAddItem = () => {
    if (!newItem.trim()) {
      setError('Please enter an item name');
      return;
    }

    // Check if item already exists in inventory
    if (inventory.includes(newItem.trim())) {
      setError('This item is already in your inventory');
      return;
    }

    // Check if item exists in drinkItems
    const drinkItem = drinkItems.find(di => di.name.toLowerCase() === newItem.trim().toLowerCase());
    if (!drinkItem) {
      setError('This item is not in our database. Please select from the predefined list.');
      return;
    }

    // Add new item and update localStorage
    const updatedInventory = [...inventory, newItem.trim()];
    setInventory(updatedInventory);
    saveInventory(updatedInventory);

    setNewItem('');
    setError(null);
  };

  /**
   * Adds all items from drinkItems.ts to the inventory
   */
  const handleAddAllItems = () => {
    const allItems = drinkItems.map(item => item.name);
    const updatedInventory = Array.from(new Set([...inventory, ...allItems]));
    setInventory(updatedInventory);
    saveInventory(updatedInventory);
  };

  /**
   * Handles removing an item from the inventory
   * @param itemToRemove The item to be removed
   */
  const handleRemoveItem = (itemToRemove: string) => {
    const updatedInventory = inventory.filter(item => item !== itemToRemove);
    setInventory(updatedInventory);
    saveInventory(updatedInventory);
  };

  /**
   * Categorizes inventory items into spirits, mixers, and garnishes
   * @returns Object containing categorized items
   */
  const categorizedItems = inventory.reduce((acc, item) => {
    const drinkItem = drinkItems.find(di => di.name === item);
    
    if (drinkItem) {
      // Categorize based on the item's category
      if (drinkItem.category === 'spirit') {
        acc.spirits.push(item);
      } else if (drinkItem.category === 'mixer') {
        acc.mixers.push(item);
      } else if (drinkItem.category === 'garnish') {
        acc.garnishes.push(item);
      }
    }
    
    return acc;
  }, { spirits: [], mixers: [], garnishes: [] } as Record<string, string[]>);

  // Render the component
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        My Inventory
      </Typography>

      {/* Add new item section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Add New Item" 
          subheader="Enter an item from our database"
        />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              label="Item Name"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              error={!!error}
              helperText={error}
            />
            <Button
              variant="contained"
              onClick={handleAddItem}
              disabled={!newItem.trim()}
              sx={{ mt: 1 }}
            >
              Add
            </Button>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleAddAllItems}
              startIcon={<AddIcon />}
            >
              Add All Ingredients
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Inventory categories grid */}
      <Grid container spacing={3}>
        {/* Spirits category */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Spirits" 
              avatar={<LocalBar />}
            />
            <CardContent>
              <List>
                {categorizedItems.spirits.map((item) => (
                  <ListItem
                    key={item}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleRemoveItem(item)}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Mixers category */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Mixers" 
              avatar={<LocalDrink />}
            />
            <CardContent>
              <List>
                {categorizedItems.mixers.map((item) => (
                  <ListItem
                    key={item}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleRemoveItem(item)}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Garnishes category */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Garnishes" 
              avatar={<Restaurant />}
            />
            <CardContent>
              <List>
                {categorizedItems.garnishes.map((item) => (
                  <ListItem
                    key={item}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleRemoveItem(item)}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 