import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Auth/AuthContext";
import AuthPage from "./Auth/AuthPage";
import HomePage from "./Home/HomePage";
import CategoriesPage from "./Categories/CategoriesPage";
import CategoryDetailPage from "./Categories/CategoryDetailPage";
import RecipesPage from "./Recipes/RecipesPage";
import RecipeDetailPage from "./Recipes/RecipeDetailPage";
import CreateRecipePage from "./Recipes/CreateRecipePage";
import EditRecipePage from "./Recipes/EditRecipePage";
import CookbookPage from "./Cookbooks/CookbookPage";
import CookbookDetailPage from "./Cookbooks/CookbookDetailPage";
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
                    path="/categories/:categoryId" 
                    element={
                        <ProtectedRoute>
                            <CategoryDetailPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/recipes" 
                    element={
                        <ProtectedRoute>
                            <RecipesPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/recipe/:recipeId" 
                    element={
                        <ProtectedRoute>
                            <RecipeDetailPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/recipe/create" 
                    element={
                        <ProtectedRoute>
                            <CreateRecipePage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/recipe/edit/:recipeId" 
                    element={
                        <ProtectedRoute>
                            <EditRecipePage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/cookbooks" 
                    element={
                        <ProtectedRoute>
                            <CookbookPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/cookbook/:cookbookId" 
                    element={
                        <ProtectedRoute>
                            <CookbookDetailPage />
                        </ProtectedRoute>
                    } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
};

export default App;