from django.shortcuts import render
from rest_framework import generics
from .serializers import CategorySerializer, IngredientSerializer, NutritionSerializer, QuantitySerializer, RecipeIngredientsSerializer, UnitSerializer, UserSerializer, RecipeSerializer, ReviewSerializer
from .models import User, Recipe, Review, Category, RecipeIngredients, Ingredient, Unit, Quantity, Nutrition

# Create your views here.
class UserView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class RecipeView(generics.CreateAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

class ReviewView(generics.ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class CategoryView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class RecipeIngredientsView(generics.ListAPIView):
    queryset = RecipeIngredients.objects.all()
    serializer_class = RecipeIngredientsSerializer

class IngredientView(generics.ListAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

class UnitView(generics.ListAPIView):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer

class QuantityView(generics.ListAPIView):
    queryset = Quantity.objects.all()
    serializer_class = QuantitySerializer

class NutritionView(generics.ListAPIView):
    queryset = Nutrition.objects.all()
    serializer_class = NutritionSerializer
