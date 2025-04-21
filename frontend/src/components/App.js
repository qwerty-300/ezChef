import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Auth/AuthContext";
import AuthPage from "./Auth/AuthPage";
import HomePage from "./Home/HomePage";
import CategoriesPage from "./Categories/CategoriesPage";
import CategoryDetailPage from "./Categories/CategoryDetailPage";
import ProtectedRoute from "./Auth/ProtectedRoute";

const App = () => {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route 
                    path="/home" 
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/categories" 
                    element={
                        <ProtectedRoute>
                            <CategoriesPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/category/:categoryId" 
                    element={
                        <ProtectedRoute>
                            <CategoryDetailPage />
                        </ProtectedRoute>
                    } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
};

export default App;