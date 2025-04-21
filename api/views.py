from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.hashers import make_password, check_password
from .serializers import CategorySerializer, IngredientSerializer, NutritionSerializer, QuantitySerializer, RecipeIngredientsSerializer, UnitSerializer, UserSerializer, RecipeSerializer, ReviewSerializer
from .models import User, Recipe, Review, Category, RecipeIngredients, Ingredient, Unit, Quantity, Nutrition, Client

# Authentication Related Views

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        f_name = request.data.get('f_name', '')
        l_name = request.data.get('l_name', '')
        
        if not username or not email or not password:
            return Response({'message': 'Please provide all required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({'message': 'Username is already taken'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'message': 'Email is already registered'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user with hashed password
        hashed_password = make_password(password)
        user = User(
            username=username,
            email=email,
            password=hashed_password,
            f_name=f_name,
            l_name=l_name
        )
        user.save()
        
        # Create client record for the user
        client = Client(user_id=user.id)
        client.save()
        
        # Generate JWT tokens
        from .jwt_utils import generate_tokens_for_user
        tokens = generate_tokens_for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'token': tokens['access'],
            'refresh': tokens['refresh'],
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'f_name': user.f_name,
                'l_name': user.l_name
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({'message': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if password matches
        if check_password(password, user.password):
            # Password is hashed and matches
            pass
        elif user.password == password:
            # For non-hashed passwords (development only)
            # In production, you should ensure all passwords are hashed
            pass
        else:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate JWT tokens
        from .jwt_utils import generate_tokens_for_user
        tokens = generate_tokens_for_user(user)
        
        return Response({
            'message': 'Login successful',
            'token': tokens['access'],
            'refresh': tokens['refresh'],
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'f_name': user.f_name,
                'l_name': user.l_name
            }
        }, status=status.HTTP_200_OK)


class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({'message': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from .jwt_utils import validate_token, generate_tokens_for_user
        
        # Validate refresh token
        payload = validate_token(refresh_token)
        if not payload:
            return Response({'message': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate new tokens
        tokens = generate_tokens_for_user(user)
        
        return Response({
            'access': tokens['access']
        }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    def get(self, request):
        # This assumes authentication middleware has already set request.user
        user = request.user
        
        if not user:
            return Response({'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'f_name': user.f_name,
            'l_name': user.l_name
        }, status=status.HTTP_200_OK)

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