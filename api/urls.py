from django.urls import path
from .views import (
    CategoryView, IngredientView, NutritionView, QuantityView, 
    RecipeIngredientsView, ReviewView, UnitView, UserView, RecipeView,
    # authentication views
    RegisterView, LoginView, RefreshTokenView, UserProfileView
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    
    path('user/', UserView.as_view()),
    #path('client/', ClientView.as_view()), BROKEN
    path('recipe/', RecipeView.as_view()),
    #path('review/', ReviewView.as_view()), # BROKEN
    path('category/', CategoryView.as_view()),
    path('recipeingredients/', RecipeIngredientsView.as_view()),
    path('ingredients/', IngredientView.as_view()),
    path('unit/', UnitView.as_view()),
    path('quantity/', QuantityView.as_view()),
    path('nutrition/', NutritionView.as_view())
]