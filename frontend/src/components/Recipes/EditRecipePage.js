import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { useAuth } from "../Auth/AuthContext";

// These could come from an API call
const REGIONS = [
  "American", "Italian", "Mexican", "Chinese", "Japanese", 
  "Indian", "French", "Thai", "Mediterranean", "Middle Eastern"
];

const TYPES = [
  "Breakfast", "Lunch", "Dinner", "Appetizer", "Soup", 
  "Salad", "Main Course", "Side Dish", "Dessert", "Snack", "Beverage"
];

const UNITS = [
  "cup", "tablespoon", "teaspoon", "ounce", "pound", 
  "gram", "kilogram", "milliliter", "liter", "pinch", 
  "slice", "piece", "whole"
];

const EditRecipePage = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: 3,
    categoryType: "",
    categoryRegion: "",
    instructions: "",
    ingredients: []
  });
  
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    amount: "",
    unit: "",
    calories: "",
    protein: ""
  });
  
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/recipes/${recipeId}`);
        
        if (!response.ok) {
          throw new Error('Recipe not found');
        }
        
        const data = await response.json();
        
        // Check if the user is the owner of the recipe
        if (currentUser.userId !== data.user.userId) {
          navigate(`/recipe/${recipeId}`);
          return;
        }
        
        // Format the data for the form
        setFormData({
          name: data.name,
          description: data.description,
          difficulty: data.difficulty,
          categoryType: data.category.type,
          categoryRegion: data.category.region,
          instructions: data.instructions,
          ingredients: data.recipeIngredients.map(ing => ({
            id: Date.now() + Math.random(), // temporary unique ID for the UI
            name: ing.ingredient.ingredientName,
            amount: ing.quantity.amount,
            unit: ing.unit.name,
            calories: ing.nutrition ? ing.nutrition.calorieCount : "",
            protein: ing.nutrition ? ing.nutrition.proteinCount : ""
          }))
        });
        
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [recipeId, currentUser, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDifficultyChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      difficulty: newValue
    }));
  };
  
  const handleIngredientChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.amount || !newIngredient.unit) {
      setError("Please fill in at least the ingredient name, amount, and unit");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          ...newIngredient,
          id: Date.now()  
        }
      ]
    }));
    
    setNewIngredient({
      name: "",
      amount: "",
      unit: "",
      calories: "",
      protein: ""
    });
    
    setError("");
  };
  
  const removeIngredient = (id) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(item => item.id !== id)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.categoryType || 
        !formData.categoryRegion || !formData.instructions || formData.ingredients.length === 0) {
      setError("Please fill in all required fields and add at least one ingredient");
      return;
    }
    
    setSaving(true);
    setError("");
    
    try {
      const recipeData = {
        name: formData.name,
        description: formData.description,
        difficulty: formData.difficulty,
        userId: currentUser.userId,
        category: {
          type: formData.categoryType,
          region: formData.categoryRegion
        },
        instructions: formData.instructions,
        ingredients: formData.ingredients.map(ing => ({
          ingredient: {
            ingredientName: ing.name
          },
          quantity: {
            amount: parseFloat(ing.amount)
          },
          unit: {
            name: ing.unit
          },
          nutrition: ing.calories || ing.protein ? {
            calorieCount: ing.calories ? parseInt(ing.calories) : 0,
            proteinCount: ing.protein ? parseInt(ing.protein) : 0
          } : null
        }))
      };
      
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update recipe');
      }
      
      navigate(`/recipe/${recipeId}`);
      
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      {/* Top App Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "green" }}>
            ezChef
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link 
            underline="hover" 
            color="inherit" 
            onClick={() => navigate("/home")}
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate("/recipes")}
            sx={{ cursor: "pointer" }}
          >
            Recipes
          </Link>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate(`/recipe/${recipeId}`)}
            sx={{ cursor: "pointer" }}
          >
            {formData.name}
          </Link>
          <Typography color="text.primary">Edit Recipe</Typography>
        </Breadcrumbs>
        
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Recipe
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Update your recipe information
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Recipe Information */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Recipe Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={saving}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category Type</InputLabel>
                  <Select
                    name="categoryType"
                    value={formData.categoryType}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    {TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Region</InputLabel>
                  <Select
                    name="categoryRegion"
                    value={formData.categoryRegion}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    {REGIONS.map((region) => (
                      <MenuItem key={region} value={region}>
                        {region}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ width: '100%' }}>
                  <Typography id="difficulty-slider" gutterBottom>
                    Difficulty (1-5)
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <Slider
                        value={formData.difficulty}
                        onChange={handleDifficultyChange}
                        step={1}
                        marks
                        min={1}
                        max={5}
                        valueLabelDisplay="auto"
                        aria-labelledby="difficulty-slider"
                        disabled={saving}
                      />
                    </Grid>
                    <Grid item>
                      <Chip 
                        label={formData.difficulty} 
                        color={
                          formData.difficulty <= 2 ? "success" : 
                          formData.difficulty <= 4 ? "primary" : 
                          "error"
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Ingredients
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Ingredient Name"
                      name="name"
                      value={newIngredient.name}
                      onChange={handleIngredientChange}
                      disabled={saving}
                    />
                  </Grid>
                  
                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      label="Amount"
                      name="amount"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      value={newIngredient.amount}
                      onChange={handleIngredientChange}
                      disabled={saving}
                    />
                  </Grid>
                  
                  <Grid item xs={6} sm={2}>
                    <FormControl fullWidth>
                      <InputLabel>Unit</InputLabel>
                      <Select
                        name="unit"
                        value={newIngredient.unit}
                        onChange={handleIngredientChange}
                        disabled={saving}
                      >
                        {UNITS.map((unit) => (
                          <MenuItem key={unit} value={unit}>
                            {unit}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      label="Calories"
                      name="calories"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={newIngredient.calories}
                      onChange={handleIngredientChange}
                      disabled={saving}
                    />
                  </Grid>
                  
                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      label="Protein (g)"
                      name="protein"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={newIngredient.protein}
                      onChange={handleIngredientChange}
                      disabled={saving}
                    />
                  </Grid>
                </Grid>
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addIngredient}
                  disabled={saving}
                >
                  Add Ingredient
                </Button>
                
                {formData.ingredients.length > 0 && (
                  <List sx={{ mt: 2 }}>
                    {formData.ingredients.map((ing, index) => (
                      <React.Fragment key={ing.id}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem>
                          <ListItemText
                            primary={`${ing.amount} ${ing.unit} ${ing.name}`}
                            secondary={
                              ing.calories || ing.protein
                                ? `${ing.calories || 0} calories, ${ing.protein || 0}g protein`
                                : null
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              aria-label="delete" 
                              onClick={() => removeIngredient(ing.id)}
                              disabled={saving}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Instructions
                </Typography>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={8}
                  label="Cooking Instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  disabled={saving}
                />
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/recipe/${recipeId}`)}
                  sx={{ mr: 2 }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default EditRecipePage;