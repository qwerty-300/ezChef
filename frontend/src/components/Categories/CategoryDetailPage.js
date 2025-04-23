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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Timer as TimerIcon,
  Restaurant as RestaurantIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from "@mui/icons-material";

// Sample recipe data for a specific category - replace with API call in production
const SAMPLE_RECIPES = {
  1: [
    {
      id: 101,
      title: "Fluffy Pancakes",
      description: "Classic fluffy pancakes perfect for a weekend breakfast",
      image: "https://source.unsplash.com/random?pancakes",
      cookingTime: 20,
      servings: 4,
      difficulty: "Easy",
      rating: 4.8
    },
    {
      id: 102,
      title: "Avocado Toast",
      description: "Simple and nutritious avocado toast with various toppings",
      image: "https://source.unsplash.com/random?avocadotoast",
      cookingTime: 10,
      servings: 2,
      difficulty: "Easy",
      rating: 4.5
    },
    {
      id: 103,
      title: "Veggie Omelette",
      description: "Protein-packed omelette with fresh vegetables",
      image: "https://source.unsplash.com/random?omelette",
      cookingTime: 15,
      servings: 1,
      difficulty: "Medium",
      rating: 4.6
    },
    {
      id: 104,
      title: "Breakfast Burrito",
      description: "Hearty breakfast burrito filled with eggs, potatoes, and cheese",
      image: "https://source.unsplash.com/random?burrito",
      cookingTime: 25,
      servings: 2,
      difficulty: "Medium",
      rating: 4.7
    },
    {
      id: 105,
      title: "Overnight Oats",
      description: "Convenient and healthy breakfast prepared the night before",
      image: "https://source.unsplash.com/random?oats",
      cookingTime: 5,
      servings: 1,
      difficulty: "Easy",
      rating: 4.4
    },
    {
      id: 106,
      title: "French Toast",
      description: "Delicious French toast with maple syrup and fresh berries",
      image: "https://source.unsplash.com/random?frenchtoast",
      cookingTime: 20,
      servings: 4,
      difficulty: "Easy",
      rating: 4.9
    }
  ],
  // Add more sample data for other categories as needed
  2: [
    {
      id: 201,
      title: "Chicken Caesar Salad",
      description: "Classic Caesar salad with grilled chicken and homemade dressing",
      image: "https://source.unsplash.com/random?caesarsalad",
      cookingTime: 20,
      servings: 2,
      difficulty: "Easy",
      rating: 4.7
    },
    {
      id: 202,
      title: "Veggie Wrap",
      description: "Nutritious vegetable wrap with hummus and feta cheese",
      image: "https://source.unsplash.com/random?wrap",
      cookingTime: 15,
      servings: 1,
      difficulty: "Easy",
      rating: 4.4
    }
  ]
};

// Sample category details
const SAMPLE_CATEGORIES = {
  1: {
    id: 1,
    name: "Breakfast",
    description: "Start your day with these delicious breakfast recipes",
    image: "https://source.unsplash.com/random?breakfast",
    recipeCount: 42
  },
  2: {
    id: 2,
    name: "Lunch",
    description: "Quick and easy lunch ideas for busy days",
    image: "https://source.unsplash.com/random?lunch",
    recipeCount: 37
  }
  // Add more categories as needed
};

const CategoryDetailPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    // Simulate API call with setTimeout
    const fetchCategoryDetails = () => {
      setLoading(true);
      // In a real app, replace this with actual API calls
      setTimeout(() => {
        const categoryData = SAMPLE_CATEGORIES[categoryId];
        const recipeData = SAMPLE_RECIPES[categoryId] || [];
        
        if (categoryData) {
          setCategory(categoryData);
          setRecipes(recipeData);
          setFilteredRecipes(recipeData);
          setLoading(false);
        } else {
          setError("Category not found");
          setLoading(false);
        }
      }, 1000);
    };

    fetchCategoryDetails();
  }, [categoryId]);

  useEffect(() => {
    if (recipes.length === 0) return;
    
    // Apply filters and sorting
    let filtered = [...recipes];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply time filter
    if (timeFilter !== 'all') {
      const timeLimit = parseInt(timeFilter);
      filtered = filtered.filter(recipe => recipe.cookingTime <= timeLimit);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'time':
        filtered.sort((a, b) => a.cookingTime - b.cookingTime);
        break;
      case 'newest':
        // In a real app, you would sort by date
        // For this sample, we'll keep the order
        break;
      default:
        break;
    }
    
    setFilteredRecipes(filtered);
  }, [recipes, searchQuery, sortBy, timeFilter]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value);
  };

  const handleRecipeClick = (recipeId) => {
    // Navigate to recipe detail page
    navigate(`/recipe/${recipeId}`);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/categories')}
        >
          Back to Categories
        </Button>
      </Box>
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
            onClick={() => navigate("/categories")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "green" }}>
            ezChef
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Hero section with category image */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 150, sm: 200, md: 250 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={category?.image}
          alt={category?.name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.7)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textAlign: "center",
            padding: 2,
          }}
        >
          <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
            {category?.name}
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 800 }}>
            {category?.description}
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Breadcrumbs navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link 
            underline="hover" 
            color="inherit" 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate("/home");
            }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link 
            underline="hover" 
            color="inherit" 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate("/categories");
            }}
          >
            Categories
          </Link>
          <Typography color="text.primary">{category?.name}</Typography>
        </Breadcrumbs>

        {/* Search and filter tools */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
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
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                id="sort-by"
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="time">Cooking Time</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="time-filter-label">Cooking Time</InputLabel>
              <Select
                labelId="time-filter-label"
                id="time-filter"
                value={timeFilter}
                label="Cooking Time"
                onChange={handleTimeFilterChange}
              >
                <MenuItem value="all">All Times</MenuItem>
                <MenuItem value="15">15 min or less</MenuItem>
                <MenuItem value="30">30 min or less</MenuItem>
                <MenuItem value="60">1 hour or less</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Recipe count */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Recipe' : 'Recipes'}
          </Typography>
          {filteredRecipes.length !== recipes.length && (
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => {
                setSearchQuery('');
                setTimeFilter('all');
                setSortBy('popular');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Recipes grid */}
        {filteredRecipes.length > 0 ? (
          <Grid container spacing={3}>
            {filteredRecipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe.id}>
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
                  <CardActionArea onClick={() => handleRecipeClick(recipe.id)}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={recipe.image}
                      alt={recipe.title}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {recipe.title}
                        </Typography>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Favorite clicked');
                          }}
                        >
                          <FavoriteBorderIcon />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {recipe.description}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimerIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {recipe.cookingTime} min
                          </Typography>
                        </Box>
                        <Chip 
                          label={recipe.difficulty} 
                          size="small" 
                          color={
                            recipe.difficulty === 'Easy' ? 'success' : 
                            recipe.difficulty === 'Medium' ? 'primary' : 
                            'warning'
                          }
                          variant="outlined"
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontWeight: 'bold' }}
                          >
                            {recipe.rating}★
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", mt: 4, p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>No recipes found</Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or filters
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CategoryDetailPage;