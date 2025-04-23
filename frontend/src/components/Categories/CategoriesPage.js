import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
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

  const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {

      const fetchCategories = async () => {
          setLoading(true);
          try {
            const res = await fetch('/api/categories/'); 
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data = await res.json();
    
            // Map to real fields
            const cats = data.map(cat => ({
              id: cat.categoryId,
              type: cat.rtype || 'Uncategorized',
              region: cat.region || 'Unknown',
            }));
    
            console.log('Mapped categories:', cats);
            setCategories(cats);
          } catch (err) {
            console.error('Error loading categories:', err);
            setError('Failed to load categories');
          } finally {
            setLoading(false);
          }
        };
    
        fetchCategories();  
    }, []);
  
    const handleCategoryClick = (categoryId) => {
      // Navigate to category detail page
      navigate(`/category/${categoryId}/`);
    };
  
    const handleSearch = (e) => {
      setSearchQuery(e.target.value);
    };
  
    const filteredCategories = categories.filter((category) => {
      const q = searchQuery.toLowerCase();
      const type = (category.type || '').toLowerCase();
      const reg = (category.region || '').toLowerCase();
      return type.includes(q) || reg.includes(q);
    });
  
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
                    {/* <CardActionArea onClick={() => handleCategoryClick(category.id)}>
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
                        </Typography> */}

                    <CardActionArea onClick={() => handleCategoryClick(category.id)}>
                      <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {category.type}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                          {category.region}
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