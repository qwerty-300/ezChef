import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  Rating
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Timer as TimerIcon,
  FavoriteBorder as FavoriteBorderIcon
} from "@mui/icons-material";

const RecipesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  // Category options that would come from the API
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // replace w api calls
        setCategories([
          "Breakfast", "Lunch", "Dinner", "Appetizer", "Soup", 
          "Salad", "Main Course", "Side Dish", "Dessert", "Snack", "Beverage"
        ]);
        
        setRegions([
          "American", "Italian", "Mexican", "Chinese", "Japanese", 
          "Indian", "French", "Thai", "Mediterranean", "Middle Eastern"
        ]);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        
        // Replace with actual API call when backend is implemented
        const response = await fetch('/api/recipes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        
        const data = await response.json();
        setRecipes(data);
        setFilteredRecipes(data);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Failed to load recipes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
  }, []);
  
  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...recipes];
    
    // Search filter
    if (searchQuery) {
      const lowercase = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe => {
        // recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        // recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
        const nameMatch = recipe.name?.toLowerCase().includes(lowercase);
        const desc = recipe.description ?? "";
        const descMatch = desc.toLowerCase().includes(lowercase);
        return nameMatch || descMatch;
    });
    }
    
    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(
        recipe => recipe.category?.type === categoryFilter // Added ?
      );
    }
    
    // Region filter
    if (regionFilter) {
      filtered = filtered.filter(
        recipe => recipe.category?.region === regionFilter // Added ?
      );
    }
    
    // Difficulty filter
    if (difficultyFilter) {
      filtered = filtered.filter(recipe => recipe.difficulty === parseInt(difficultyFilter));
    }
    
    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
        break;
      case 'highest_rated':
        filtered.sort((a, b) => {
          const aRating = a.reviews && a.reviews.length > 0 
            ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length 
            : 0;
          const bRating = b.reviews && b.reviews.length > 0 
            ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length 
            : 0;
          return bRating - aRating;
        });
        break;
      case 'difficulty_asc':
        filtered.sort((a, b) => a.difficulty - b.difficulty);
        break;
      case 'difficulty_desc':
        filtered.sort((a, b) => b.difficulty - a.difficulty);
        break;
      default:
        break;
    }
    
    setFilteredRecipes(filtered);
  }, [recipes, searchQuery, categoryFilter, regionFilter, difficultyFilter, sortBy]);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };
  
  const handleRegionChange = (e) => {
    setRegionFilter(e.target.value);
  };
  
  const handleDifficultyChange = (e) => {
    setDifficultyFilter(e.target.value);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setRegionFilter("");
    setDifficultyFilter("");
    setSortBy("newest");
  };
  
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };
  
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) {
      return 0;
    }
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };
  
  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "#f9fafb" }}>
      {/* Top App Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate("/home")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "green" }}>
            ezChef
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/recipe/create")}
          >
            Add Recipe
          </Button>
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
          <Typography color="text.primary">Recipes</Typography>
        </Breadcrumbs>
        
        {/* Page Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            All Recipes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore our collection of delicious recipes
          </Typography>
        </Box>
        
        {/* Search and Filters */}
        <Card elevation={0} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      onChange={handleCategoryChange}
                      label="Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Region</InputLabel>
                    <Select
                      value={regionFilter}
                      onChange={handleRegionChange}
                      label="Region"
                    >
                      <MenuItem value="">All Regions</MenuItem>
                      {regions.map((region) => (
                        <MenuItem key={region} value={region}>
                          {region}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={difficultyFilter}
                      onChange={handleDifficultyChange}
                      label="Difficulty"
                    >
                      <MenuItem value="">All Levels</MenuItem>
                      <MenuItem value="1">1 - Very Easy</MenuItem>
                      <MenuItem value="2">2 - Easy</MenuItem>
                      <MenuItem value="3">3 - Medium</MenuItem>
                      <MenuItem value="4">4 - Hard</MenuItem>
                      <MenuItem value="5">5 - Very Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={handleSortChange}
                      label="Sort By"
                    >
                      <MenuItem value="newest">Newest First</MenuItem>
                      <MenuItem value="oldest">Oldest First</MenuItem>
                      <MenuItem value="highest_rated">Highest Rated</MenuItem>
                      <MenuItem value="difficulty_asc">Easiest First</MenuItem>
                      <MenuItem value="difficulty_desc">Hardest First</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Clear Filters Button */}
          {(searchQuery || categoryFilter || regionFilter || difficultyFilter || sortBy !== "newest") && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={clearFilters}
                startIcon={<FilterListIcon />}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Card>
        
        {/* Recipe Count */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Recipe' : 'Recipes'} Found
          </Typography>
        </Box>
        
        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </Box>
        ) : filteredRecipes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              No recipes found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your filters or search criteria
            </Typography>
            {searchQuery || categoryFilter || regionFilter || difficultyFilter ? (
              <Button
                variant="outlined"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate("/recipe/create")}
              >
                Add Your First Recipe
              </Button>
            )}
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
                  <CardActionArea onClick={() => handleRecipeClick(recipe.recipeId)}>
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
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating
                              value={calculateAverageRating(recipe.reviews)}
                              precision={0.5}
                              size="small"
                              readOnly
                            />
                          </Box>
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {recipe.description?.length > 120
                          ? `${recipe.description.substring(0, 120)}...`
                          : (recipe.description ?? "No description available")}
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
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        
                        <Typography variant="caption" color="text.secondary">
                          {new Date(recipe.dateAdded).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default RecipesPage;