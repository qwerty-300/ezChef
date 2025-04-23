from django.shortcuts import render
from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from django.contrib.auth.hashers import check_password
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count

from .serializers import (
    CategorySerializer, IngredientSerializer, NutritionSerializer, QuantitySerializer,
    RecipeIngredientsSerializer, UnitSerializer, UserSerializer, RecipeSerializer,
    ReviewSerializer, AddRecipeSerializer, CookbookSerializer
)
from .models import (
    User, Recipe, Review, Category, RecipeIngredients, Ingredient, Unit,
    Quantity, Nutrition, AddRecipe, Cookbook
)

# ---------------USERS Views---------------#
class UserView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# ---------------RECIPE (and others) Views---------------#
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []

class RecipeListView(generics.ListAPIView):
    queryset = Recipe.objects.prefetch_related('category')
    serializer_class = RecipeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category__category_id']
    search_fields = ['recipe_name', 'recipe_description']
    permission_classes = []

class RecipeDetailView(generics.RetrieveAPIView):
    queryset = Recipe.objects.prefetch_related('category')
    serializer_class = RecipeSerializer
    lookup_field = 'recipe_id'
    lookup_url_kwarg = 'recipe_id'
    permission_classes = []

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

# ---------------COOKBOOK VIEWS---------------#
class CookbookListView(generics.ListAPIView):
    queryset = Cookbook.objects.all()
    serializer_class = CookbookSerializer
    permission_classes = [permissions.IsAuthenticated]

class CookbookDetailView(generics.RetrieveUpdateAPIView):
    queryset = Cookbook.objects.all()
    serializer_class = CookbookSerializer
    lookup_field = 'cb_id'
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        cookbook = self.get_object()
        if cookbook.creator != request.user:
            return Response({'detail': 'You do not have permission to edit this cookbook.'},
                            status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

class CookbookEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = AddRecipeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AddRecipe.objects.filter(cb=self.kwargs['cb_id'], user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, cb_id=self.kwargs['cb_id'])

# ---------------REVIEW VIEW---------------#
class ReviewView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user_id=self.request.user.id)

    def create(self, request, *args, **kwargs):
        user = request.user
        data = request.data

        recipe = data.get("recipe")
        cookbook = data.get("cookbook")

        existing_review = None
        if recipe:
            existing_review = Review.objects.filter(user_id=user.id, recipe_id=recipe).first()
        elif cookbook:
            existing_review = Review.objects.filter(user_id=user.id, cookbook_id=cookbook).first()

        if existing_review:
            serializer = self.get_serializer(existing_review, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user_id=user.id)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

