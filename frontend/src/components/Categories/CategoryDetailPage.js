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
  Divider
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon
} from "@mui/icons-material";

const CategoryDetailPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/categories/${categoryId}/`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();

        setCategory({
          id:          data.categoryId,
          name:        data.catname,
          image:       data.imageUrl,        
          description: data.descriptionText,
        });

        setRecipes(
          (data.recipes || []).map(r => ({
            id:          r.recipeId,
            name:        r.name,
            description: r.description,
            dateAdded:   r.dateAdded,
            difficulty:  r.difficulty,
            image:       r.imageUrl,   
          }))
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load category details");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleSearch = e => setSearchQuery(e.target.value);

  // filter on the fly
  const displayed = searchQuery
    ? recipes.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recipes;

  if (loading) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/categories')}>
          Back to Categories
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "#f9fafb" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate("/categories")} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "green" }}>
            ezChef
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Box sx={{ width:"100%", height:{ xs:150, sm:200, md:250 }, position:"relative", overflow:"hidden" }}>
        {category.image && (
          <Box
            component="img"
            src={category.image}
            alt={category.name}
            sx={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.7)" }}
          />
        )}
        <Box sx={{
            position:"absolute", top:0, left:0, width:"100%", height:"100%",
            display:"flex", flexDirection:"column", justifyContent:"center",
            alignItems:"center", color:"white", textAlign:"center", p:2
          }}>
          <Typography variant="h3" sx={{ fontWeight:"bold", mb:1 }}>
            {category.name}
          </Typography>
          {category.description && (
            <Typography variant="h6" sx={{ maxWidth:800 }}>
              {category.description}
            </Typography>
          )}
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ mt:4, mb:8 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb:3 }}>
          <Link color="inherit" onClick={() => navigate("/home")} sx={{ display:"flex", alignItems:"center" }}>
            <HomeIcon fontSize="inherit" sx={{ mr:0.5 }} /> Home
          </Link>
          <Link color="inherit" onClick={() => navigate("/categories")}>
            Categories
          </Link>
          <Typography color="text.primary">{category.name}</Typography>
        </Breadcrumbs>

        {/* Search (optional) */}
        <Box sx={{ mb:4, maxWidth:400 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search recipes…"
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

        {/* Recipes */}
        {displayed.length > 0 ? (
          <Grid container spacing={3}>
            {displayed.map(recipe => (
              <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                <Card sx={{ width: 300, height:"100%", display:"flex", flexDirection:"column", transition:"0.3s",
                            "&:hover":{ transform:"translateY(-5px)", boxShadow:6 } }}>
                  <CardActionArea onClick={() => navigate(`/recipe/${recipe.id}`)}>
                    {recipe.image && (
                      <CardMedia component="img" height="180" image={recipe.image} alt={recipe.name} />
                    )}
                    <CardContent>
                      <Typography gutterBottom variant="h6">{recipe.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb:2 }}>
                        {recipe.description}
                      </Typography>
                      <Divider sx={{ mb:2 }} />
                      <Box sx={{ display:"flex", gap:1, alignItems:"center" }}>
                        <Chip label={`Difficulty: ${recipe.difficulty}`} size="small" />
                        <Typography variant="caption">Added on {recipe.dateAdded}</Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign:"center", mt:4, p:4 }}>
            <Typography variant="h6" gutterBottom>No recipes found</Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CategoryDetailPage;
