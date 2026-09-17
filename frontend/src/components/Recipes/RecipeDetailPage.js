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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  ListItemButton,
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
import { getHeaders } from "../../services/api";

const RecipeDetailPage = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [cookbookDialogOpen, setCookbookDialogOpen] = useState(false);
  const [userCookbooks, setUserCookbooks] = useState([]);
  const [cookbookActionError, setCookbookActionError] = useState("");
  const [savingToCookbook, setSavingToCookbook] = useState(false);
  // const [showFullInstructions, setShowFullInstructions] = useState(false);
  
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/recipes/${recipeId}/`, {
          credentials: 'include',
          headers: getHeaders()
        });
        
        if (!response.ok) {
          throw new Error('Recipe not found');
        }
        
        const data = await response.json();
        setRecipe(data);
        
        // Check if recipe is saved in user's cookbook
        if (currentUser) {
          const savedResponse = await fetch(`/api/users/${currentUser.id}/cookbooks/recipes/${recipeId}/`, {
            credentials: 'include',
            headers: getHeaders()
          });
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
      navigate('/');
      return;
    }

    setCookbookActionError("");
    try {
      const response = await fetch(`/api/users/${currentUser.id}/cookbooks/`, {
        credentials: 'include',
        headers: getHeaders()
      });
      if (!response.ok) {
        throw new Error('Could not load your cookbooks');
      }
      const data = await response.json();
      setUserCookbooks(data);
      setCookbookDialogOpen(true);
    } catch (err) {
      console.error('Error loading cookbooks:', err);
      setCookbookActionError(err.message || 'Could not load cookbooks');
    }
  };

  const addRecipeToCookbook = async (cookbookId) => {
    setSavingToCookbook(true);
    setCookbookActionError("");
    try {
      const response = await fetch(`/api/cookbooks/${cookbookId}/recipes/${recipeId}/`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders()
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.detail || 'Failed to add recipe to cookbook');
      }
      setIsSaved(true);
      setCookbookDialogOpen(false);
    } catch (err) {
      console.error('Error adding recipe to cookbook:', err);
      setCookbookActionError(err.message || 'Failed to add recipe to cookbook');
    } finally {
      setSavingToCookbook(false);
    }
  };

  const createCookbookAndAdd = async () => {
    setSavingToCookbook(true);
    setCookbookActionError("");
    try {
      const createResponse = await fetch('/api/cookbooks/', {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({
          title: 'My Cookbook',
          description: 'Saved recipes',
        }),
      });
      if (!createResponse.ok) {
        const data = await createResponse.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create cookbook');
      }
      const cookbook = await createResponse.json();
      await addRecipeToCookbook(cookbook.cookbookId);
    } catch (err) {
      console.error('Error creating cookbook:', err);
      setCookbookActionError(err.message || 'Failed to create cookbook');
      setSavingToCookbook(false);
    }
  };
  
  const handleEditRecipe = () => {
    navigate(`/recipe/edit/${recipeId}`);
  };
  
  const handleDeleteRecipe = async () => {
    if (window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/recipes/${recipeId}/`, {
          method: 'DELETE',
          credentials: 'include',
          headers: getHeaders()
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
          <Button
            color="primary"
            variant="outlined"
            startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            onClick={handleSaveRecipe}
            sx={{ mr: 1 }}
          >
            Add to cookbook
          </Button>
          {currentUser && recipe.user && currentUser.id === recipe.user.userId && (
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
                {(recipe.cat || recipe.category || []).map(c => (
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
                {(recipe.recipeIngredients || []).map((item, index) => (
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
                      {review.user.firstName?.charAt(0) || ''}{review.user.lastName?.charAt(0) || ''}
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

      <Dialog open={cookbookDialogOpen} onClose={() => setCookbookDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add to a cookbook</DialogTitle>
        <DialogContent>
          {cookbookActionError && (
            <Alert severity="error" sx={{ mb: 2 }}>{cookbookActionError}</Alert>
          )}
          {userCookbooks.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              You do not have a cookbook yet. Create one to save this recipe.
            </Typography>
          ) : (
            <List>
              {userCookbooks.map((cb) => (
                <ListItemButton
                  key={cb.cookbookId}
                  disabled={savingToCookbook}
                  onClick={() => addRecipeToCookbook(cb.cookbookId)}
                >
                  <ListItemText
                    primary={cb.title}
                    secondary={cb.description || `${(cb.recipes || []).length} recipes`}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCookbookDialogOpen(false)} disabled={savingToCookbook}>
            Cancel
          </Button>
          {userCookbooks.length === 0 && (
            <Button
              variant="contained"
              onClick={createCookbookAndAdd}
              disabled={savingToCookbook}
            >
              {savingToCookbook ? <CircularProgress size={24} /> : 'Create cookbook and add'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecipeDetailPage;