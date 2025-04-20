from django.shortcuts import render
from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from django.contrib.auth.hashers import check_password
from django_filters.rest_framework import DjangoFilterBackend

from .serializers import CategorySerializer, IngredientSerializer, NutritionSerializer, QuantitySerializer, RecipeIngredientsSerializer, UnitSerializer, UserSerializer, RecipeSerializer, ReviewSerializer, AddRecipeSerializer, CookbookSerializer
from .models import User, Recipe, Review, Category, RecipeIngredients, Ingredient, Unit, Quantity, Nutrition, AddRecipe, Cookbook


# Create your views here.

# ---------------USERS Views---------------#
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


# ---------------RECIPE (and others) Views---------------#
# List of categories
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []

# Lists of recipes and their associated category/difficulty
class RecipeListView(generics.ListAPIView):
    queryset = Recipe.objects.prefetch_related('category')
    serializer_class = RecipeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category__category_id']
    search_fields = ['recipe_name', 'recipe_description']
    permission_classes = []

# Returns desired recipe with all fields and category
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

class CookbookDetailView(generics.RetrieveAPIView):
    queryset = Cookbook.objects.all()
    serializer_class = CookbookSerializer
    lookup_field = 'cb_id'
    permission_classes = [permissions.IsAuthenticated]

class CookbookEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = AddRecipeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AddRecipe.objects.filter(
            cb=self.kwargs['cb_id'], user=self.request.user
        )
    
    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            cb_id=self.kwargs['cb_id']
        )

class ReviewView(generics.ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
