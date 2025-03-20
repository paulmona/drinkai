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
  const [newItemCategory, setNewItemCategory] = useState<'spirit' | 'mixer' | 'garnish'>('mixer');
  const [error, setError] = useState<string | null>(null);
  const [customItems, setCustomItems] = useState<Record<string, 'spirit' | 'mixer' | 'garnish'>>({});

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

    // Create a unique ID for the custom item
    const customItemId = `custom-${newItem.trim().toLowerCase().replace(/\s+/g, '-')}`;

    // Check if item already exists in inventory
    if (inventory.includes(customItemId)) {
      setError('This item is already in your inventory');
      return;
    }

    // Add new item and update localStorage
    const updatedInventory = [...inventory, customItemId];
    setInventory(updatedInventory);
    saveInventory(updatedInventory);

    // Store the category for the custom item
    setCustomItems(prev => ({
      ...prev,
      [customItemId]: newItemCategory
    }));

    setNewItem('');
    setNewItemCategory('mixer'); // Reset category to default
    setError(null);
  };

  /**
   * Handles removing an item from the inventory
   * @param itemToRemove The item to be removed
   */
  const handleRemoveItem = (itemToRemove: string) => {
    // Convert the display name back to an ID
    const itemId = itemToRemove.startsWith('custom-') 
      ? itemToRemove 
      : drinkItems.find(di => di.name === itemToRemove)?.id || itemToRemove;

    const updatedInventory = inventory.filter(item => item !== itemId);
    setInventory(updatedInventory);
    saveInventory(updatedInventory);
    
    // Remove from custom items if it exists
    const { [itemId]: removed, ...rest } = customItems;
    setCustomItems(rest);
  };

  /**
   * Categorizes inventory items into spirits, mixers, and garnishes
   * @returns Object containing categorized items
   */
  const categorizedItems = inventory.reduce((acc, itemId) => {
    // First check if it's a custom item
    if (customItems[itemId]) {
      acc[customItems[itemId]].push(itemId.replace('custom-', '').replace(/-/g, ' '));
      return acc;
    }

    // Then check if it exists in drinkItems array
    const drinkItem = drinkItems.find(di => di.id === itemId);
    
    if (drinkItem) {
      // Categorize based on the item's category
      if (drinkItem.category === 'spirit') {
        acc.spirits.push(drinkItem.name);
      } else if (drinkItem.category === 'mixer') {
        acc.mixers.push(drinkItem.name);
      } else if (drinkItem.category === 'garnish') {
        acc.garnishes.push(drinkItem.name);
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
          subheader="Enter an ingredient and select its category"
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
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newItemCategory}
                label="Category"
                onChange={(e) => setNewItemCategory(e.target.value as 'spirit' | 'mixer' | 'garnish')}
              >
                <MenuItem value="spirit">Spirit</MenuItem>
                <MenuItem value="mixer">Mixer</MenuItem>
                <MenuItem value="garnish">Garnish</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleAddItem}
              disabled={!newItem.trim()}
              sx={{ mt: 1 }}
            >
              Add
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