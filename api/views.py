from django.shortcuts import render
from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from django.contrib.auth.hashers import check_password
from django_filters.rest_framework import DjangoFilterBackend

from .serializers import CategorySerializer, IngredientSerializer, NutritionSerializer, QuantitySerializer, RecipeIngredientsSerializer, UnitSerializer, UserSerializer, RecipeSerializer, ReviewSerializer
from .models import User, Recipe, Review, Category, RecipeIngredients, Ingredient, Unit, Quantity, Nutrition
from .filters import RecipeFilter


# Create your views here.

# ---------------Users---------------#
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

# Sign-up endpoint
class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

# Login endpoint
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response(
                {"Detail": "Username and Password required."}, status = status.HTTP_400_BAD_REQUEST
            )
        
        # Checks if user exists
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"Detail": "Invalid credentials."}, status = status.HTTP_401_UNAUTHORIZED
            )
        
        # Checks if input password is invalid
        if not check_password(password, user.password):
            return Response(
                {"Detail": "Invalid credentials."}, status = status.HTTP_401_UNAUTHORIZED
            )
        
        # Get/Create token for this user
        token, _ = Token.objects.get_or_create(user_id=user.id)
        return Response({
            "token": token.key,
            "user_id": user.id,
            "username": user.username
        })


# ---------------Recipes---------------#
# List of categories
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []

# Lists of recipes and their associated category/difficulty
class RecipeListView(generics.ListAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    # categories for existing recipes not inserted, otherwise commented out code works
    # queryset = Recipe.objects.select_related('category') 
    # serializer_class = RecipeSerializer
    # filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    # filterset_class = RecipeFilter
    # search_fields = ['recipe_name', 'recipe_description']
    permission_classes = []

# Returns desired recipe with all fields and category
class RecipeDetailView(generics.RetrieveAPIView):
    # same problem, because no category mapped to a recipe
    #queryset = Recipe.objects.select_related('category') 
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    lookup_field = 'recipe_id'
    lookup_url_kwarg = 'recipe_id'
    permission_classes = []

class ReviewView(generics.ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

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
