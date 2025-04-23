from django.urls import path
from .views import UserView, CategoryListView, RecipeListView, RecipeDetailView, CookbookListView, CookbookDetailView, CookbookEntryListCreateView


urlpatterns = [
    #---User---#
    path('user/', UserView.as_view()),
    #---Recipe---#
    path('categories/', CategoryListView.as_view(), name='category'),
    path('recipes/', RecipeListView.as_view(), name='recipe-list'),
    path('recipes/<int:recipe_id>/', RecipeDetailView.as_view(), name='recipe-detail'),
    #---Cookbook---#
    path('cookbooks/', CookbookListView.as_view(), name='cookbook-list'),
    path('cookbooks/<int:cb_id>/', CookbookDetailView.as_view(), name='cookbook-detail'),
    # path('cookbooks/<int:cb_id>/entries/', CookbookEntryListCreateView.as_view(), name='cookbook-entries'),
]
