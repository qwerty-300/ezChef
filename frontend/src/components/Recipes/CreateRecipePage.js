import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: 3,
    catname: "",
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
          id: Date.now()  // temporary ID for the UI
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
    
    if (!formData.name || !formData.description || !formData.catname || !formData.instructions || formData.ingredients.length === 0) {
      setError("Please fill in all required fields and add at least one ingredient");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const recipeData = {
        name: formData.name,
        description: formData.description,
        difficulty: formData.difficulty,
        id: currentUser.userId,
        dateAdded: new Date().toISOString(),
        category: formData.catname,
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
      
      const response = await fetch('/api/recipes/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Make sure to include auth token
        },
        body: JSON.stringify(recipeData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create recipe');
      }
      
      const data = await response.json();
      navigate(`/recipe/${data.recipeId}`);
      
    } catch (err) {
      console.error('Error creating recipe:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
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
          <Typography color="text.primary">Create New Recipe</Typography>
        </Breadcrumbs>
        
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Recipe
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Share your favorite recipe with the ezChef community
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
                  disabled={loading}
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
                  disabled={loading}
                  placeholder="Describe your recipe in a few sentences"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category Type</InputLabel>
                  <Select
                    name="catname"
                    value={formData.catname}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
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
                        disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={6} sm={2}>
                    <FormControl fullWidth>
                      <InputLabel>Unit</InputLabel>
                      <Select
                        name="unit"
                        value={newIngredient.unit}
                        onChange={handleIngredientChange}
                        disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </Grid>
                </Grid>
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addIngredient}
                  disabled={loading}
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
                              disabled={loading}
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
                  disabled={loading}
                  placeholder="Provide step-by-step instructions for preparing your recipe"
                  helperText="Use numbered steps (e.g., 1. Preheat oven...)"
                />
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Recipe'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateRecipePage;