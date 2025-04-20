// src/components/Home/HomePage.js
import React, { useState } from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Logout as LogoutIcon,
  MenuBook as MenuBookIcon,
  Category as CategoryIcon,
  Restaurant as RestaurantIcon,
} from "@mui/icons-material";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // In a real app, navigate to search results
      // navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    // In a real app, remove auth token
    // localStorage.removeItem("authToken");
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "green" }}>
            ezChef
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Hello, User
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
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
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<CategoryIcon sx={{ fontSize: 60, color: "green" }} />}
              title="Categories"
              description="Browse recipes by category"
              onClick={() => console.log("Categories clicked")}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<MenuBookIcon sx={{ fontSize: 60, color: "green" }} />}
              title="Cookbook"
              description="Access your saved recipes"
              onClick={() => console.log("Cookbook clicked")}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<RestaurantIcon sx={{ fontSize: 60, color: "green" }} />}
              title="Chef Mode"
              description="Get step-by-step cooking guidance"
              onClick={() => console.log("Chef Mode clicked")}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;