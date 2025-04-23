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
  Breadcrumbs,
  Link,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MenuBook as MenuBookIcon
} from "@mui/icons-material";
import { useAuth } from "../Auth/AuthContext";

const CookbookPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cookbooks, setCookbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New cookbook dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [newCookbookName, setNewCookbookName] = useState("");
  const [newCookbookDescription, setNewCookbookDescription] = useState("");
  const [creatingCookbook, setCreatingCookbook] = useState(false);
  
  useEffect(() => {
    const fetchCookbooks = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Replace with actual API call when backend is implemented
        const response = await fetch(`/api/users/${currentUser.userId}/cookbooks`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cookbooks');
        }
        
        const data = await response.json();
        setCookbooks(data);
      } catch (err) {
        console.error('Error fetching cookbooks:', err);
        setError('Failed to load cookbooks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCookbooks();
  }, [currentUser]);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredCookbooks = cookbooks.filter(cookbook => 
    cookbook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cookbook.description && cookbook.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNewCookbookName("");
    setNewCookbookDescription("");
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleCreateCookbook = async () => {
    if (!newCookbookName.trim()) {
      return;
    }
    
    try {
      setCreatingCookbook(true);
      
      const cookbookData = {
        title: newCookbookName.trim(),
        description: newCookbookDescription.trim(),
        userId: currentUser.userId,
        numOfSaves: 0
      };
      
      const response = await fetch('/api/cookbooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cookbookData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create cookbook');
      }
      
      const newCookbook = await response.json();
      setCookbooks(prev => [...prev, newCookbook]);
      handleCloseDialog();
      
    } catch (err) {
      console.error('Error creating cookbook:', err);
    } finally {
      setCreatingCookbook(false);
    }
  };
  
  const handleCookbookClick = (cookbookId) => {
    navigate(`/cookbook/${cookbookId}`);
  };
  
  const handleDeleteCookbook = async (cookbookId, event) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this cookbook? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/cookbooks/${cookbookId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete cookbook');
        }
        
        setCookbooks(prev => prev.filter(cookbook => cookbook.cookbookId !== cookbookId));
      } catch (err) {
        console.error('Error deleting cookbook:', err);
      }
    }
  };
  
  const handleEditCookbook = (cookbookId, event) => {
    event.stopPropagation();
    navigate(`/cookbook/edit/${cookbookId}`);
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
          <Typography color="text.primary">My Cookbooks</Typography>
        </Breadcrumbs>
        
        {/* Page Title and Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              My Cookbooks
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Organize your favorite recipes into collections
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            New Cookbook
          </Button>
        </Box>
        
        {/* Search Box */}
        <TextField
          fullWidth
          placeholder="Search cookbooks..."
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
        ) : filteredCookbooks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
            {searchQuery ? (
              <>
                <Typography variant="h6" gutterBottom>
                  No cookbooks found
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
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  You don't have any cookbooks yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first cookbook to organize your favorite recipes
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                >
                  Create Cookbook
                </Button>
              </>
            )}
          </Box>
        ) : (
          // Cookbooks Grid
          <Grid container spacing={3}>
            {filteredCookbooks.map((cookbook) => (
              <Grid item xs={12} sm={6} md={4} key={cookbook.cookbookId}>
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
                    onClick={() => handleCookbookClick(cookbook.cookbookId)}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      bgcolor: 'primary.light', 
                      color: 'white',
                      p: 3
                    }}>
                      <MenuBookIcon sx={{ fontSize: 60 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {cookbook.title}
                      </Typography>
                      
                      {cookbook.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {cookbook.description.length > 100
                            ? `${cookbook.description.substring(0, 100)}...`
                            : cookbook.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ mt: 'auto' }}>
                        <Typography variant="body2" color="text.secondary">
                          {cookbook.recipes ? `${cookbook.recipes.length} recipes` : "No recipes yet"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={(e) => handleEditCookbook(cookbook.cookbookId, e)}
                      title="Edit cookbook"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={(e) => handleDeleteCookbook(cookbook.cookbookId, e)}
                      title="Delete cookbook"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      
      {/* Create Cookbook Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Cookbook</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Cookbook Name"
            fullWidth
            variant="outlined"
            value={newCookbookName}
            onChange={(e) => setNewCookbookName(e.target.value)}
            disabled={creatingCookbook}
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
            value={newCookbookDescription}
            onChange={(e) => setNewCookbookDescription(e.target.value)}
            disabled={creatingCookbook}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={creatingCookbook}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCookbook} 
            variant="contained" 
            color="primary"
            disabled={!newCookbookName.trim() || creatingCookbook}
          >
            {creatingCookbook ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CookbookPage;