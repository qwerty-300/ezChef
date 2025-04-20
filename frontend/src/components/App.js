import React from "react";
import {Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./Auth/AuthPage";
import HomePage from "./Home/HomePage";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;