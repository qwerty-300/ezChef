import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from "@mui/material";
import {
  Search as SearchIcon,
  Logout as LogoutIcon,
  MenuBook as MenuBookIcon,
  Category as CategoryIcon,
  Restaurant as RestaurantIcon,
  Add as AddIcon,
  Bookmark as BookmarkIcon,
  Star as StarIcon
} from "@mui/icons-material";
import { useAuth } from "../Auth/AuthContext";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Replace with actual API calls when backend is implemented
        const recentResponse = await fetch('/api/recipes?sort=newest&limit=3');
        const popularResponse = await fetch('/api/recipes?sort=popular&limit=3');
        
        if (recentResponse.ok && popularResponse.ok) {
          const recentData = await recentResponse.json();
          const popularData = await popularResponse.json();
          
          setRecentRecipes(recentData);
          setPopularRecipes(popularData);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const FeatureCard = ({ icon, title, description, onClick }) => (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
      <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          {icon}
        </Box>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onClick} sx={{ mx: "auto" }}>
          Explore
        </Button>
      </CardActions>
    </Card>
  );

  const RecipePreview = ({ recipe, index }) => (
    <Card 
      sx={{ 
        display: 'flex', 
        mb: 2, 
        cursor: 'pointer',
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateX(5px)",
        } 
      }}
      onClick={() => navigate(`/recipe/${recipe.recipeId}`)}
    >
      <CardMedia
        component="img"
        sx={{ width: 120 }}
        image={recipe.image || `https://source.unsplash.com/random?food,${index}`}
        alt={recipe.name}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h6">
            {recipe.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            {recipe.description?.length > 60 
              ? `${recipe.description.substring(0, 60)}...` 
              : (recipe.description ?? "No description available")}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1 }}>
            {new Date(recipe.dateAdded).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "green" }}>
            ezChef
          </Typography>
          {currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.main',
                  mr: 1
                }}
              >
                {currentUser.f_name ? currentUser.f_name.charAt(0) : ""}
              </Avatar>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {currentUser.username || "User"}
              </Typography>
              <IconButton color="inherit" onClick={handleLogout} title="Logout">
                <LogoutIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to ezChef
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your personal recipe assistant
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 700, mx: "auto", mb: 6 }}>
          <Box sx={{ display: "flex" }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              sx={{ px: 3 }}
            >
              Search
            </Button>
          </Box>
        </Box>

        {/* Feature Cards */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<CategoryIcon sx={{ fontSize: 60, color: "green" }} />}
              title="Categories"
              description="Browse recipes by category"
              onClick={() => navigate("/categories")}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<MenuBookIcon sx={{ fontSize: 60, color: "green" }} />}
              title="Cookbook"
              description="Access your saved recipes"
              onClick={() => navigate("/cookbooks")}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<RestaurantIcon sx={{ fontSize: 60, color: "green" }} />}
              title="All Recipes"
              description="Explore all available recipes"
              onClick={() => navigate("/recipes")}
            />
          </Grid>
        </Grid>
        
        {/* Quick Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => navigate("/recipe/create")}
            sx={{ mx: 1 }}
          >
            Create Recipe
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<BookmarkIcon />}
            size="large"
            onClick={() => navigate("/cookbooks")}
            sx={{ mx: 1 }}
          >
            My Cookbooks
          </Button>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Recipe Previews */}
        <Grid container spacing={4}>
          {/* Recently Added Recipes */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AddIcon sx={{ mr: 1 }} /> Recently Added
            </Typography>
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>Loading...</Typography>
              </Box>
            ) : recentRecipes.length > 0 ? (
              recentRecipes.map((recipe, index) => (
                <RecipePreview key={recipe.recipeId} recipe={recipe} index={index} />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No recent recipes found
              </Typography>
            )}
            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Button 
                variant="text" 
                onClick={() => navigate("/recipes?sort=newest")}
              >
                View All Recent
              </Button>
            </Box>
          </Grid>
          
          {/* Popular Recipes */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ mr: 1 }} /> Most Popular
            </Typography>
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>Loading...</Typography>
              </Box>
            ) : popularRecipes.length > 0 ? (
              popularRecipes.map((recipe, index) => (
                <RecipePreview key={recipe.recipeId} recipe={recipe} index={index + 3} />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No popular recipes found
              </Typography>
            )}
            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Button 
                variant="text" 
                onClick={() => navigate("/recipes?sort=highest_rated")}
              >
                View All Popular
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;