import React, { useState } from "react";
import { Box, Container, Paper, Tabs, Tab, Typography } from "@mui/material";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const AuthPage = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box 
        sx={{
            minHeight: "100vh",
            background: "linear-gradient(to right, #4caf50, #2196f3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 3,
            px: 2,
        }}
        >
            <Container maxWidth="sm">
                <Paper elevation={6} sx={{ p: 4, borderRadius: 2}}>
                    <Box textAlign="center" mb={4}>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            ezChef
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mt={1}>
                            Your personal recipe assistant!
                        </Typography>
                    </Box>

                    <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3}}>
                        <Tab label="Log In" />
                        <Tab label="Sign Up" />
                    </Tabs>

                    {activeTab === 0 ? <LoginForm /> : <SignupForm />}
                </Paper>
            </Container>
        </Box>
    );
};

export default AuthPage;