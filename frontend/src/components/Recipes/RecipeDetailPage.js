import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Rating,
  Avatar,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  IconButton,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link
} from "@mui/material";
import {
  Timer as TimerIcon,
  Restaurant as RestaurantIcon,
  Assignment as AssignmentIcon,
  FiberManualRecord as BulletIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from "@mui/icons-material";
import { useAuth } from "../Auth/AuthContext";
import ReviewForm from "./ReviewForm";

const RecipeDetailPage = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  // const [showFullInstructions, setShowFullInstructions] = useState(false);
  
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        
        // Replace with actual API call when backend is implemented
        const response = await fetch(`/api/recipes/${recipeId}/`, {
          headers: { 'Content-Type': 'application/json'}
        });
        
        if (!response.ok) {
          throw new Error('Recipe not found');
        }
        
        const data = await response.json();
        setRecipe(data);
        
        // Check if recipe is saved in user's cookbook
        if (currentUser) {
          const savedResponse = await fetch(`/api/users/${currentUser.userId}/cookbooks/recipes/${recipeId}/`);
          setIsSaved(savedResponse.ok);
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [recipeId, currentUser]);
  
  const handleSaveRecipe = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const endpoint = isSaved 
        ? `/api/users/${currentUser.userId}/cookbooks/recipes/${recipeId}`
        : `/api/users/${currentUser.userId}/cookbooks/recipes/${recipeId}`;
        
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cookbook');
      }
      
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Error updating cookbook:', err);
    }
  };
  
  const handleEditRecipe = () => {
    navigate(`/recipe/edit/${recipeId}`);
  };
  
  const handleDeleteRecipe = async () => {
    if (window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/recipes/${recipeId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete recipe');
        }
        
        navigate('/recipes');
      } catch (err) {
        console.error('Error deleting recipe:', err);
      }
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !recipe) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Recipe not found'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/recipes')}
          sx={{ mt: 2 }}
        >
          Back to Recipes
        </Button>
      </Container>
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
          <IconButton 
            color="primary"
            onClick={handleSaveRecipe}
            title={isSaved ? "Remove from cookbook" : "Save to cookbook"}
          >
            {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
          {currentUser && currentUser.userId === recipe.user.userId && (
            <>
              <IconButton 
                color="primary" 
                onClick={handleEditRecipe}
                title="Edit recipe"
                sx={{ ml: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                color="error" 
                onClick={handleDeleteRecipe}
                title="Delete recipe"
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
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
          {/* {recipe.cat.length > 0 && (
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/category/${recipe.category.categoryId}')}
            sx={{ cursor: "pointer"}}
          >
            {recipe.cat[0].catname}
          </Link>
          )} */}
          <Typography color="text.primary">{recipe.name}</Typography>
        </Breadcrumbs>
        
        {/* Recipe Header */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" component="h1" gutterBottom>
                {recipe.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                {recipe.cat.map(c => (
                  <Chip
                    key={c.categoryId}
                    label={c.catname}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
                <Chip
                  label={`Difficulty: ${recipe.difficulty}/5`}
                  color="default"
                  variant="outlined"
                  size="small"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                  Posted by {recipe.user.username} on {new Date(recipe.dateAdded).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                {recipe.description}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <Grid container spacing={4}>
          {/* Ingredients Section */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              <List>
                {recipe.recipeIngredients.map((item, index) => (
                  <ListItem key={index} disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <BulletIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="body1">
                          {item.quantity.amount} {item.unit.name} {item.ingredient.ingredientName}
                        </Typography>
                      }
                      secondary={
                        item.nutrition && (
                          <Typography variant="caption" color="text.secondary">
                            {item.nutrition.calorieCount} cal, {item.nutrition.proteinCount}g protein
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Instructions Section */}
          {/* <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              
              <Box sx={{ whiteSpace: 'pre-line' }}>
                {showFullInstructions
                  ? recipe.instructions
                  : recipe.instructions.split('\n').slice(0, 5).join('\n')}
              </Box>
              
              {recipe.instructions.split('\n').length > 5 && (
                <Button 
                  variant="text"
                  onClick={() => setShowFullInstructions(!showFullInstructions)}
                  sx={{ mt: 2 }}
                >
                  {showFullInstructions ? 'Show Less' : 'Show More'}
                </Button>
              )}
            </Paper>
          </Grid>*/}
        </Grid>
        
        {/* Reviews Section */}
        <Paper elevation={0} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Reviews {recipe.reviews && `(${recipe.reviews.length})`}
          </Typography>
          
          {currentUser && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add Your Review
              </Typography>
              <ReviewForm recipeId={recipeId} />
            </Box>
          )}
          
          <Divider sx={{ mb: 3 }} />
          
          {recipe.reviews && recipe.reviews.length > 0 ? (
            recipe.reviews.map((review) => (
              <Card key={review.reviewId} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                      {review.user.firstName.charAt(0) + review.user.lastName.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle1">
                      {review.user.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {new Date(review.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Rating value={review.rating} readOnly precision={0.5} sx={{ mb: 1 }} />
                  <Typography variant="body2">
                    {review.comment}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No reviews yet. Be the first to leave a review!
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default RecipeDetailPage;