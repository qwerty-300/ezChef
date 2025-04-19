from django.urls import path
from .views import CategoryView, IngredientView, NutritionView, QuantityView, RecipeIngredientsView, ReviewView, UnitView, UserView, RecipeView

urlpatterns = [
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