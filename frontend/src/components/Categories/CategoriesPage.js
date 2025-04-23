import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    Chip,
    Divider,
    Breadcrumbs,
    Link,
    CircularProgress
  } from "@mui/material";
  import {
    Search as SearchIcon,
    ArrowBack as ArrowBackIcon,
    Home as HomeIcon
  } from "@mui/icons-material";

  const SAMPLE_CATEGORIES = [
    {
        id: 1,
        name: "Breakfast",
        description: "Start your day with these delicious breakfast recipes",
        image: "https://potatorolls.com/wp-content/uploads/Lumberjack-Breakfast2-960x640.jpg",
        recipeCount: 42
    },
    {
        id: 2,
        name: "Lunch",
        description: "Quick and easy lunch ideas for busy days",
        image: "https://source.unsplash.com/random?lunch",
        recipeCount: 37
      },
      {
        id: 3,
        name: "Dinner",
        description: "Impressive dinner recipes for any occasion",
        image: "https://source.unsplash.com/random?dinner",
        recipeCount: 58
      },
      {
        id: 4,
        name: "Desserts",
        description: "Sweet treats to satisfy your cravings",
        image: "https://source.unsplash.com/random?dessert",
        recipeCount: 64
      },
      {
        id: 5,
        name: "Vegetarian",
        description: "Delicious meat-free meals for everyone",
        image: "https://source.unsplash.com/random?vegetarian",
        recipeCount: 45
      },
      {
        id: 6,
        name: "Vegan",
        description: "Plant-based recipes that don't compromise on flavor",
        image: "https://source.unsplash.com/random?vegan",
        recipeCount: 38
      },
      {
        id: 7,
        name: "Gluten-Free",
        description: "Gluten-free recipes that taste amazing",
        image: "https://source.unsplash.com/random?glutenfree",
        recipeCount: 29
      },
      {
        id: 8,
        name: "Quick & Easy",
        description: "Recipes ready in 30 minutes or less",
        image: "https://source.unsplash.com/random?quickmeal",
        recipeCount: 52
      },
      {
        id: 9,
        name: "Healthy",
        description: "Nutritious recipes for a balanced diet",
        image: "https://source.unsplash.com/random?healthyfood",
        recipeCount: 47
      },
      {
        id: 10,
        name: "Baking",
        description: "Breads, pastries, and other baked goods",
        image: "https://source.unsplash.com/random?baking",
        recipeCount: 33
      },
      {
        id: 11,
        name: "International",
        description: "Explore cuisines from around the world",
        image: "https://source.unsplash.com/random?international",
        recipeCount: 70
      },
      {
        id: 12,
        name: "Drinks",
        description: "Refreshing beverages for any occasion",
        image: "https://source.unsplash.com/random?drinks",
        recipeCount: 28
      }
  ];

  const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      // Simulate API call with setTimeout
      const fetchCategories = () => {
        setLoading(true);
        // In a real app, replace this with an actual API call
        setTimeout(() => {
          setCategories(SAMPLE_CATEGORIES);
          setLoading(false);
        }, 1000);
      };
  
      fetchCategories();
    }, []);
  
    const handleCategoryClick = (categoryId) => {
      // Navigate to category detail page
      navigate(`/category/${categoryId}`);
    };
  
    const handleSearch = (e) => {
      setSearchQuery(e.target.value);
    };
  
    const filteredCategories = categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
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
          </Toolbar>
        </AppBar>
  
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
            <Typography color="text.primary">Categories</Typography>
          </Breadcrumbs>
  
          {/* Page title */}
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            Recipe Categories
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Browse our collection of recipes by category
          </Typography>
  
          {/* Search box */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search categories..."
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
          </Box>
  
          {/* Category grid */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography color="error">{error}</Typography>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{ mt: 2 }}
              >
                Try Again
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredCategories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
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
                    <CardActionArea onClick={() => handleCategoryClick(category.id)}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={category.image}
                        alt={category.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography gutterBottom variant="h6" component="div">
                            {category.name}
                          </Typography>
                          <Chip 
                            label={`${category.recipeCount} recipes`} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* No results message */}
          {!loading && filteredCategories.length === 0 && (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="h6">No categories found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try a different search term
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    );
  };
  
  export default CategoriesPage;