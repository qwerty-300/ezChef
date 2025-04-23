from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', views.RefreshTokenView.as_view(), name='token_refresh'),
    path('user/profile/', views.UserProfileView.as_view(), name='user_profile'),
    
    # Recipe endpoints
    path('recipes/', views.RecipeListView.as_view(), name='recipe_list'),
    path('recipes/<int:recipe_id>/', views.RecipeDetailView.as_view(), name='recipe_detail'),
    path('recipes/search/', views.SearchRecipesView.as_view(), name='search_recipes'),
    path('recipes/create/', views.CreateRecipeView.as_view(), name='create_recipe'),
    
    # Category endpoints
    path('categories/', views.CategoryView.as_view(), name='category_list'),
    path('categories/<int:category_id>/', views.CategoryDetailView.as_view(), name='category_detail'),
    path('categories/<int:category_id>/recipes/', views.RecipeListView.as_view(), name='category_recipes'),
    
    # Review endpoints
    # path('reviews/', views.ReviewListCreateView.as_view(), name='review_list'),
    # path('recipes/<int:recipe_id>/reviews/', views.ReviewListCreateView.as_view(), name='recipe_reviews'),
    
    # Cookbook endpoints
    # path('users/<int:user_id>/cookbooks/', views.UserCookbooksView.as_view(), name='user_cookbooks'),
    
    # Other model endpoints (can keep if useful)
    path('users/', views.UserView.as_view()),
    path('ingredients/', views.IngredientView.as_view()),
    path('units/', views.UnitView.as_view()),
    path('quantities/', views.QuantityView.as_view()),
    path('nutritions/', views.NutritionView.as_view()),
    path('recipe-ingredients/', views.RecipeIngredientsView.as_view()),
]
