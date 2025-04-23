import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TextField, 
  Button, 
  Box, 
  Alert, 
  CircularProgress,
  Grid
} from "@mui/material";
import { useAuth } from "../Auth/AuthContext";

// helper to read the CSRF cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    f_name: "",  // First name field matching database
    l_name: "",  // Last name field matching database
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate required fields
    if (!formData.username || !formData.email || !formData.f_name || !formData.l_name || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Read CSRF token cookie
      const csrftoken = getCookie("csrftoken");

      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          f_name: formData.f_name,
          l_name: formData.l_name,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store auth token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update auth context
      setCurrentUser(data.user);
      
      // Redirect to home page
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={formData.username}
        onChange={handleChange}
        disabled={loading}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        type="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="f_name"
            label="First Name"
            name="f_name"
            autoComplete="given-name"
            value={formData.f_name}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="l_name"
            label="Last Name"
            name="l_name"
            autoComplete="family-name"
            value={formData.l_name}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
      </Grid>

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        disabled={loading}
      />

      <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
      </Button>
    </Box>
  );
};

export default SignupForm;