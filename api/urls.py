from django.urls import path
from .views import UserListView, SignupView, LoginView, CategoryListView, RecipeListView, RecipeDetailView


urlpatterns = [
    path('user/', UserListView.as_view()),
    path('login/', LoginView.as_view(), name='login'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('categories/', CategoryListView.as_view(), name='category'),
    path('recipes/', RecipeListView.as_view(), name='recipe-list'),
    path('recipes/<int:recipe_id>/', RecipeDetailView.as_view(), name='recipe-detail')
]