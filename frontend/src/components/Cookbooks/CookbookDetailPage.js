// src/components/Cookbooks/CookbookDetailPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  TextField,
  InputAdornment,
  AppBar,
  Toolbar,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Rating,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  FilterList as FilterListIcon
} from "@mui/icons-material";
import { useAuth } from "../Auth/AuthContext";

const CookbookDetailPage = () => {
  const { cookbookId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cookbook, setCookbook] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);
  
  // Edit dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Add recipe dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [addRecipeSearchQuery, setAddRecipeSearchQuery] = useState("");
  const [loadingAvailableRecipes, setLoadingAvailableRecipes] = useState(false);
  
  useEffect(() => {
    const fetchCookbook = async () => {
      try {
        setLoading(true);
        
        // Replace with actual API call when backend is implemented
        const response = await fetch(`/api/cookbooks/${cookbookId}`);
        
        if (!response.ok) {
          throw new Error('Cookbook not found');
        }
        
        const data = await response.json();
        setCookbook(data);
        setRecipes(data.recipes || []);
        
        // Pre-fill edit form
        setEditTitle(data.title);
        setEditDescription(data.description || "");
      } catch (err) {
        console.error('Error fetching cookbook:', err);
        setError('Failed to load cookbook. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCookbook();
  }, [cookbookId]);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleOpenEditDialog = () => {
    handleMenuClose();
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  
  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      return;
    }
    
    try {
      setSaving(true);
      
      const cookbookData = {
        title: editTitle.trim(),
        description: editDescription.trim()
      };
      
      const response = await fetch(`/api/cookbooks/${cookbookId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cookbookData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update cookbook');
      }
      
      // Update local state
      setCookbook(prev => ({
        ...prev,
        title: editTitle.trim(),
        description: editDescription.trim()
      }));
      
      handleCloseEditDialog();
      
    } catch (err) {
      console.error('Error updating cookbook:', err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteCookbook = async () => {
    handleMenuClose();
    
    if (window.confirm('Are you sure you want to delete this cookbook? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/cookbooks/${cookbookId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete cookbook');
        }
        
        navigate('/cookbooks');
      } catch (err) {
        console.error('Error deleting cookbook:', err);
      }
    }
  };
  
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };
  
  const handleRemoveRecipe = async (recipeId, event) => {
    event.stopPropagation();
    
    if (window.confirm('Remove this recipe from the cookbook?')) {
      try {
        const response = await fetch(`/api/cookbooks/${cookbookId}/recipes/${recipeId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove recipe');
        }
        
        // Update local state
        setRecipes(prev => prev.filter(recipe => recipe.recipeId !== recipeId));
      } catch (err) {
        console.error('Error removing recipe:', err);
      }
    }
  };
  
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
    setSelectedRecipes([]);
    setAddRecipeSearchQuery("");
    fetchAvailableRecipes();
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  
  const fetchAvailableRecipes = async () => {
    try {
      setLoadingAvailableRecipes(true);
      
      const response = await fetch(`/api/recipes?notInCookbook=${cookbookId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch available recipes');
      }
      
      const data = await response.json();
      setAvailableRecipes(data);
    } catch (err) {
      console.error('Error fetching available recipes:', err);
    } finally {
      setLoadingAvailableRecipes(false);
    }
  };
  
  const handleRecipeSelection = (recipeId) => {
    setSelectedRecipes(prev => {
      if (prev.includes(recipeId)) {
        return prev.filter(id => id !== recipeId);
      } else {
        return [...prev, recipeId];
      }
    });
  };
  
  const handleAddRecipes = async () => {
    if (selectedRecipes.length === 0) {
      return;
    }
    
    try {
      setSaving(true);
      
      for (const recipeId of selectedRecipes) {
        const response = await fetch(`/api/cookbooks/${cookbookId}/recipes/${recipeId}`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          console.error(`Failed to add recipe ${recipeId}`);
        }
      }
      
      // Refresh the cookbook to get the updated recipes
      const response = await fetch(`/api/cookbooks/${cookbookId}`);
      
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
      }
      
      handleCloseAddDialog();
      
    } catch (err) {
      console.error('Error adding recipes:', err);
    } finally {
      setSaving(false);
    }
  };
  
  const filteredAvailableRecipes = availableRecipes.filter(recipe => 
    recipe.name.toLowerCase().includes(addRecipeSearchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(addRecipeSearchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !cookbook) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Cookbook not found'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/cookbooks')}
          sx={{ mt: 2 }}
        >
          Back to Cookbooks
        </Button>
      </Container>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "#f9fafb" }}>
      {/* Top App Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate('/cookbooks')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "green" }}>
            ezChef
          </Typography>
          {currentUser && currentUser.userId === cookbook.userId && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                sx={{ mr: 2 }}
              >
                Add Recipes
              </Button>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                aria-controls={menuOpen ? 'cookbook-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="cookbook-menu"
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'cookbook-actions-button',
                }}
              >
                <MenuItem onClick={handleOpenEditDialog}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit Cookbook</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDeleteCookbook}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete Cookbook</ListItemText>
                </MenuItem>
              </Menu>
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
            onClick={() => navigate("/cookbooks")}
            sx={{ cursor: "pointer" }}
          >
            Cookbooks
          </Link>
          <Typography color="text.primary">{cookbook.title}</Typography>
        </Breadcrumbs>
        
        {/* Cookbook Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {cookbook.title}
          </Typography>
          {cookbook.description && (
            <Typography variant="body1" paragraph>
              {cookbook.description}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Created by {cookbook.user ? cookbook.user.username : "Unknown"} • 
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </Typography>
        </Box>
        
        {/* Search Box */}
        <TextField
          fullWidth
          placeholder="Search recipes in this cookbook..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 4 }}
        />
        
        {/* Recipes */}
        {recipes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              No recipes in this cookbook yet
            </Typography>
            {currentUser && currentUser.userId === cookbook.userId && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your favorite recipes to this cookbook
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                >
                  Add Recipes
                </Button>
              </>
            )}
          </Box>
        ) : filteredRecipes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              No recipes found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try a different search term
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </Box>
        ) : (
          // Recipe Grid
          <Grid container spacing={3}>
            {filteredRecipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe.recipeId}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleRecipeClick(recipe.recipeId)}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={recipe.image || `https://source.unsplash.com/random?food,${recipe.name}`}
                      alt={recipe.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {recipe.name}
                        </Typography>
                        {recipe.reviews && recipe.reviews.length > 0 && (
                          <Rating
                            value={recipe.reviews.reduce((sum, review) => sum + review.rating, 0) / recipe.reviews.length}
                            precision={0.5}
                            size="small"
                            readOnly
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {recipe.description.length > 120
                          ? `${recipe.description.substring(0, 120)}...`
                          : recipe.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip
                          label={recipe.category.type}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={recipe.category.region}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Chip 
                        label={`Difficulty: ${recipe.difficulty}/5`} 
                        size="small" 
                        color={
                          recipe.difficulty <= 2 ? "success" : 
                          recipe.difficulty <= 4 ? "primary" : 
                          "error"
                        }
                        variant="outlined"
                      />
                    </CardContent>
                  </CardActionArea>
                  
                  {currentUser && currentUser.userId === cookbook.userId && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={(e) => handleRemoveRecipe(recipe.recipeId, e)}
                        title="Remove from cookbook"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      
      {/* Edit Cookbook Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Cookbook</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Cookbook Name"
            fullWidth
            variant="outlined"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={saving}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            disabled={saving}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            color="primary"
            disabled={!editTitle.trim() || saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Recipes Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add Recipes to Cookbook</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search recipes..."
            value={addRecipeSearchQuery}
            onChange={(e) => setAddRecipeSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3, mt: 1 }}
          />
          
          {loadingAvailableRecipes ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : availableRecipes.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 4 }}>
              No available recipes to add
            </Typography>
          ) : filteredAvailableRecipes.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 4 }}>
              No recipes found matching your search
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredAvailableRecipes.map((recipe) => (
                <Grid item xs={12} sm={6} key={recipe.recipeId}>
                  <Card
                    sx={{
                      border: selectedRecipes.includes(recipe.recipeId) 
                        ? '2px solid #4caf50' 
                        : '1px solid rgba(0, 0, 0, 0.12)',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handleRecipeSelection(recipe.recipeId)}
                  >
                    <Box sx={{ display: 'flex' }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 100 }}
                        image={recipe.image || `https://source.unsplash.com/random?food,${recipe.name}`}
                        alt={recipe.name}
                      />
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {recipe.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {recipe.description.length > 60
                            ? `${recipe.description.substring(0, 60)}...`
                            : recipe.description}
                        </Typography>
                        <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
                          <Chip
                            label={recipe.category.type}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`Difficulty: ${recipe.difficulty}/5`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </CardContent>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {selectedRecipes.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1">
                {selectedRecipes.length} {selectedRecipes.length === 1 ? 'recipe' : 'recipes'} selected
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddRecipes} 
            variant="contained" 
            color="primary"
            disabled={selectedRecipes.length === 0 || saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Add to Cookbook'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CookbookDetailPage;