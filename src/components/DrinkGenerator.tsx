import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DrinkItem, drinkItems } from '../data/drinkItems';
import { loadInventory } from '../utils/inventoryManager';

// Initialize Gemini AI with API key from environment variables
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key. Please add REACT_APP_GEMINI_API_KEY to your .env file');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define interfaces for type safety
interface DrinkSuggestion {
  name: string;
  description: string;
  isMocktail?: boolean;  // Flag to indicate if the drink is non-alcoholic
}

interface CacheData {
  suggestions: DrinkSuggestion[];
  timestamp: number;      // When the cache was created
  inventoryHash: string;  // Hash of current inventory to detect changes
}

// Cache configuration
const CACHE_KEY = 'drink_suggestions_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generates a hash of the current inventory to detect changes
 * @param inventory Array of inventory item IDs
 * @returns Sorted, comma-separated string of inventory items
 */
function generateInventoryHash(inventory: string[]): string {
  return inventory.sort().join(',');
}

/**
 * Validates if a drink suggestion matches the current filter (alcoholic/non-alcoholic)
 * @param drink The drink suggestion to validate
 * @param mocktailsOnly Whether to show only non-alcoholic drinks
 * @returns boolean indicating if the drink is valid
 */
function validateDrinkSuggestion(drink: DrinkSuggestion, mocktailsOnly: boolean): boolean {
  // Keywords that indicate a drink is non-alcoholic
  const nonAlcoholicIndicators = [
    'non-alcoholic',
    'non alcoholic',
    'mocktail',
    'virgin',
    'zero-proof',
    'zero proof',
    'alcohol-free',
    'alcohol free',
    'no alcohol',
    'without alcohol'
  ];

  // Keywords that indicate a drink is alcoholic
  const alcoholicIndicators = [
    'alcoholic',
    'spirit',
    'liquor',
    'vodka',
    'gin',
    'rum',
    'tequila',
    'whiskey',
    'bourbon',
    'scotch',
    'beer',
    'wine'
  ];

  const textToCheck = `${drink.name.toLowerCase()} ${drink.description.toLowerCase()}`;
  const isNonAlcoholic = nonAlcoholicIndicators.some(indicator => textToCheck.includes(indicator));
  const isAlcoholic = alcoholicIndicators.some(indicator => textToCheck.includes(indicator));

  // If mocktailsOnly is true, only return true for non-alcoholic drinks
  if (mocktailsOnly) {
    return isNonAlcoholic;
  }
  
  // If mocktailsOnly is false, only return true for alcoholic drinks
  return isAlcoholic;
}

/**
 * Retrieves cached drink suggestions if they exist and are still valid
 * @returns Array of drink suggestions or null if cache is invalid/expired
 */
export function getCachedSuggestions(): DrinkSuggestion[] | null {
  const cacheStr = localStorage.getItem(CACHE_KEY);
  if (!cacheStr) return null;

  try {
    const cache: CacheData = JSON.parse(cacheStr);
    const currentInventory = loadInventory();
    const currentHash = generateInventoryHash(currentInventory);
    
    // Invalidate cache if it's expired or inventory has changed
    if (
      Date.now() - cache.timestamp > CACHE_DURATION ||
      cache.inventoryHash !== currentHash
    ) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return cache.suggestions;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Saves drink suggestions to the cache with current inventory hash
 * @param suggestions Array of drink suggestions to cache
 */
function saveToCache(suggestions: DrinkSuggestion[]) {
  const currentInventory = loadInventory();
  const cache: CacheData = {
    suggestions,
    timestamp: Date.now(),
    inventoryHash: generateInventoryHash(currentInventory),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export default function DrinkGenerator() {
  // State management for the component
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<DrinkSuggestion[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<DrinkSuggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numDrinks, setNumDrinks] = useState(10);
  const [mocktailsOnly, setMocktailsOnly] = useState(false);

  // Filter available items based on current inventory
  const availableItems = drinkItems.filter(item => 
    loadInventory().includes(item.id)
  );

  // Load cached suggestions when component mounts
  useEffect(() => {
    const loadCachedSuggestions = async () => {
      const cachedSuggestions = getCachedSuggestions();
      if (cachedSuggestions) {
        console.log('Loading cached suggestions on mount');
        setSuggestions(cachedSuggestions);
      } else {
        // If no cache exists, generate new suggestions
        console.log('No cached suggestions found, generating new ones');
        await generateSuggestions(true);
      }
    };

    loadCachedSuggestions();
  }, []); // Empty dependency array means this runs once on mount

  // Regenerate suggestions when numDrinks or mocktailsOnly changes
  useEffect(() => {
    generateSuggestions(true);
  }, [numDrinks, mocktailsOnly]);

  /**
   * Closes the recipe modal and resets related state
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRecipe(null);
    setSelectedDrink(null);
  };

  /**
   * Generates drink suggestions using the Gemini AI model
   * @param forceRefresh Whether to bypass cache and generate new suggestions
   */
  const generateSuggestions = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    setRecipe(null);
    setSuggestions([]);

    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedSuggestions = getCachedSuggestions();
        if (cachedSuggestions) {
          console.log('Using cached suggestions');
          setSuggestions(cachedSuggestions);
          setLoading(false);
          return;
        }
      }

      // Initialize Gemini model and prepare prompt
      console.log('Initializing Gemini model...');
      console.log('API Key present:', !!GEMINI_API_KEY);
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro"
      });

      const availableIngredients = availableItems.map(item => item.name).join(', ');
      
      // Request more drinks than needed to account for filtering
      const requestedDrinks = numDrinks * 2;
      
      // Construct prompt based on current settings (alcoholic/non-alcoholic)
      const prompt = `Given these available ingredients: ${availableIngredients}
      
      Please suggest ${requestedDrinks} possible ${mocktailsOnly ? 'NON-ALCOHOLIC mocktails' : 'ALCOHOLIC cocktails'} that could be made with these ingredients.
      ${mocktailsOnly ? 'IMPORTANT: Only suggest non-alcoholic drinks and mocktails. Do not include any alcoholic drinks.' : 'IMPORTANT: Only suggest alcoholic drinks. Do not include any non-alcoholic drinks, mocktails, or virgin drinks.'}
      
      For each drink, provide:
      1. The name of the drink
      2. A brief description of its taste and character, including whether it's alcoholic or non-alcoholic
      
      Format the response as a JSON array with objects containing "name" and "description" fields.
      Example format:
      [
        {
          "name": "Drink Name",
          "description": "Brief description of the drink, including whether it's alcoholic or non-alcoholic"
        }
      ]`;

      // Generate content using Gemini AI
      console.log('Sending prompt to Gemini:', prompt);
      const result = await model.generateContent({ 
        contents: [{ role: "user", parts: [{ text: prompt }] }] 
      });
      const response = await result.response;
      const text = response.text();
      console.log('Raw response from Gemini:', text);

      // Clean and parse the response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      console.log('Cleaned response text:', cleanedText);

      const parsedSuggestions = JSON.parse(cleanedText);
      
      // Validate and filter drinks based on current settings
      const validSuggestions = parsedSuggestions
        .filter((drink: DrinkSuggestion) => validateDrinkSuggestion(drink, mocktailsOnly))
        .slice(0, numDrinks); // Take only the requested number of drinks after filtering
      
      if (validSuggestions.length === 0) {
        throw new Error(`No valid ${mocktailsOnly ? 'mocktails' : 'alcoholic drinks'} were generated. Please try again.`);
      }

      // Update state and cache
      console.log('Validated suggestions:', validSuggestions);
      setSuggestions(validSuggestions);
      saveToCache(validSuggestions);

    } catch (error) {
      console.error('Error generating suggestions:', error);
      setError('Failed to generate drink suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generates a detailed recipe for a selected drink
   * @param drink The drink to generate a recipe for
   */
  const generateRecipe = async (drink: DrinkSuggestion) => {
    setLoading(true);
    setError(null);
    setRecipe(null);
    setSelectedDrink(drink);
    setIsModalOpen(true);

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro"
      });

      const availableIngredients = availableItems.map(item => item.name).join(', ');
      
      // Construct recipe prompt based on drink type
      const prompt = `Create a detailed recipe for the "${drink.name}" ${drink.isMocktail ? 'mocktail' : 'cocktail'} using these available ingredients: ${availableIngredients}
      
      Please provide:
      1. A list of all ingredients needed (including measurements)
      2. Step-by-step instructions
      3. Any garnish or serving suggestions
      
      Make sure to only use ingredients from the available list. If additional ingredients are needed, please note them as "optional" or "substitute with available ingredients".
      ${drink.isMocktail ? 'This is a non-alcoholic mocktail, so do not include any alcoholic ingredients.' : 'This is an alcoholic cocktail, so include appropriate spirits.'}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setRecipe(text);
    } catch (error) {
      console.error('Detailed error:', error);
      if (error instanceof Error) {
        setError(`Error generating recipe: ${error.message}`);
      } else {
        setError('Error generating recipe. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Render the component
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Drink Generator
      </Typography>

      {/* Controls section */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Number of drinks selector */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Number of Drinks</InputLabel>
          <Select
            value={numDrinks}
            label="Number of Drinks"
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setNumDrinks(newValue);
              generateSuggestions(true);
            }}
            disabled={loading}
          >
            <MenuItem value={10}>10 Drinks</MenuItem>
            <MenuItem value={20}>20 Drinks</MenuItem>
            <MenuItem value={30}>30 Drinks</MenuItem>
          </Select>
        </FormControl>

        {/* Mocktails toggle switch */}
        <FormControlLabel
          control={
            <Switch
              checked={mocktailsOnly}
              onChange={(e) => {
                setMocktailsOnly(e.target.checked);
                generateSuggestions(true);
              }}
              disabled={loading}
            />
          }
          label="Mocktails"
        />

        {/* Action buttons */}
        <Button
          variant="contained"
          onClick={() => generateSuggestions(false)}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Show Possible Drinks'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => generateSuggestions(true)}
          disabled={loading}
        >
          Refresh Suggestions
        </Button>
      </Box>

      {/* Warning for large number of drinks */}
      {numDrinks === 30 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Generating 30 drinks may take longer to process. Please be patient.
        </Alert>
      )}

      {/* Error display */}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {/* Drink suggestions list */}
      {suggestions.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Possible Drinks
            </Typography>
            <List>
              {suggestions.map((drink, index) => (
                <React.Fragment key={index}>
                  <ListItem disablePadding>
                    <ListItemButton 
                      onClick={() => generateRecipe(drink)}
                      selected={selectedDrink?.name === drink.name}
                    >
                      <ListItemText
                        primary={`${drink.name}${drink.isMocktail ? ' (Mocktail)' : ''}`}
                        secondary={drink.description}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < suggestions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Recipe modal dialog */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {selectedDrink?.name} Recipe
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseModal}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : recipe ? (
            <Typography
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                margin: 0,
              }}
            >
              {recipe}
            </Typography>
          ) : error ? (
            <Typography color="error">
              {error}
            </Typography>
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 