from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.hashers import make_password, check_password
from .serializers import CategorySerializer, IngredientSerializer, NutritionSerializer, QuantitySerializer, RecipeIngredientsSerializer, UnitSerializer, UserSerializer, RecipeListSerializer, RecipeDetailSerializer, ReviewSerializer, CookbookSerializer, AddRecipeSerializer
from .models import User, Recipe, Review, Category, RecipeIngredients, Ingredient, Unit, Quantity, Nutrition, Cookbook, IdentifiedBy

#--------------AUTHENTICATION VIEWS---------------#
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

#--------------RECIPE VIEWS---------------#
class RecipeListView(APIView):
    def get(self, request):
        """
        List all recipes with filtering and sorting
        """
        # Get query parameters
        sort = request.query_params.get('sort', 'newest')
        limit = request.query_params.get('limit', None)
        search = request.query_params.get('search', None)
        cat = request.query_params.get('cat_name', None)
        difficulty = request.query_params.get('difficulty', None)
        
        # Start with all recipes
        recipes = Recipe.objects.all()
        
        # Apply search filter
        if search:
            recipes = recipes.filter(recipe_name__icontains=search) | recipes.filter(recipe_description__icontains=search)
        
        # Apply category filters
        if cat:
            recipes = recipes.filter(category__cat_name___iexact=cat)
        
        # Apply difficulty filter
        if difficulty:
            recipes = recipes.filter(recipe_difficulty=difficulty)
        
        # Apply sorting
        if sort == 'newest':
            recipes = recipes.order_by('-date_added')
        elif sort == 'oldest':
            recipes = recipes.order_by('date_added')
        
        # Apply limit 
        if limit:
            recipes = recipes[:int(limit)]
        
        serializer = RecipeListSerializer(recipes, many=True)
        
        # Add category and user data to each recipe
        for i, recipe in enumerate(serializer.data):
            recipe_obj = recipes[i]
            recipe['cat'] = [
                { 'categoryId' : c.category_id, 'catname': c.cat_name }
                for c in recipe_obj.category.all()
            ]
            
            # Add user info (creator)
            try:
                creator = recipe_obj.user  
                recipe['user'] = {
                    'userId': creator.id,
                    'username': creator.username,
                    'firstName': creator.f_name,
                    'lastName': creator.l_name
                }
            except AttributeError:
                recipe['user'] = {
                    'userId': None,
                    'username': 'Unknown',
                    'firstName': '',
                    'lastName': ''
                }
        
        return Response(serializer.data)

class CreateRecipeView(APIView):
    def post(self, request):
        try:
            # Extract data from request
            recipe_name = request.data.get('name')
            recipe_description = request.data.get('description')
            recipe_difficulty = request.data.get('difficulty')
            category_type = request.data.get('categoryType')
            category_region = request.data.get('categoryRegion')
            ingredients = request.data.get('ingredients', [])
            instructions = request.data.get('instructions')
            
            # Validate required fields
            if not recipe_name or not recipe_description or not category_type or not category_region or not instructions:
                return Response(
                    {'message': 'Please provide all required fields'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create recipe
            recipe = Recipe(
                recipe_name=recipe_name,
                recipe_description=recipe_description,
                recipe_difficulty=recipe_difficulty,
                # date_added is auto set with CURRENT_TIMESTAMP
            )
            recipe.save()
            
            # Get or create category
            category, created = Category.objects.get_or_create(
                r_type=category_type,
                r_region=category_region
            )
            
            # Create identified_by relationship
            identified_by = IdentifiedBy(
                ib_r_id=recipe,
                ib_c_id=category
            )
            identified_by.save()
            
            # Process ingredients
            for ing_data in ingredients:
                # Get or create ingredient
                ingredient_name = ing_data.get('name')
                if not ingredient_name:
                    continue
                    
                ingredient, created = Ingredient.objects.get_or_create(
                    ingredient_name=ingredient_name
                )
                
                # Get or create quantity
                amount = ing_data.get('amount', 0)
                quantity, created = Quantity.objects.get_or_create(
                    quantity_amount=float(amount)
                )
                
                # Get or create unit
                unit_name = ing_data.get('unit')
                unit = None
                if unit_name:
                    unit, created = Unit.objects.get_or_create(
                        unit_name=unit_name
                    )
                
                # Create recipe_ingredients entry
                recipe_ingredient = RecipeIngredients(
                    recipe=recipe,
                    ingredient=ingredient,
                    quantity=quantity,
                    unit=unit
                )
                recipe_ingredient.save()
                
                # Create nutrition info if provided
                calories = ing_data.get('calories')
                protein = ing_data.get('protein')
                if calories or protein:
                    nutrition = Nutrition(
                        ingredient=ingredient,
                        calorie_count=calories if calories else 0,
                        protein_count=protein if protein else 0,
                        unit=unit if unit else None,
                        serving_size=amount
                    )
                    nutrition.save()
            
            return Response(
                {'message': 'Recipe created successfully', 'recipeId': recipe.recipe_id},
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            # Log the error
            print(f"Error creating recipe: {str(e)}")
            return Response(
                {'message': 'An error occurred while creating the recipe'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RecipeDetailView(APIView):
    def get(self, request, recipe_id):
        try:
            recipe = Recipe.objects.get(recipe_id=recipe_id)
        except Recipe.DoesNotExist:
            return Response({'message': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = RecipeDetailSerializer(recipe)
        data = serializer.data
        
        # Add category info
        data['cat'] = [
            { 'categoryId': c.category_id, 'catname': c.cat_name}
            for c in recipe.category.all()
        ]
        
        # Add user info (creator)
        try:
            creator = recipe.user  
            data['user'] = {
                'userId': creator.id,
                'username': creator.username,
                'firstName': creator.f_name,
                'lastName': creator.l_name
            }
        except AttributeError:
            data['user'] = {
                'userId': None,
                'username': 'Unknown',
                'firstName': '',
                'lastName': ''
            }
        
        # Add ingredients
        recipe_ingredients = RecipeIngredients.objects.filter(recipe_id=recipe_id)
        data['recipeIngredients'] = []
        
        for recipe_ingredient in recipe_ingredients:
            ingredient = recipe_ingredient.ingredient
            quantity = recipe_ingredient.quantity
            unit = recipe_ingredient.unit
            
            # Get nutrition info if available
            nutrition = None
            try:
                nutrition_obj = Nutrition.objects.get(ingredient=ingredient)
                nutrition = {
                    'nutritionId': nutrition_obj.nutrition_id,
                    'calorieCount': float(nutrition_obj.calorie_count) if nutrition_obj.calorie_count else 0,
                    'proteinCount': float(nutrition_obj.protein_count) if nutrition_obj.protein_count else 0
                }
            except Nutrition.DoesNotExist:
                pass
            
            ingredient_data = {
                'ingredient': {
                    'ingredientId': ingredient.ingredient_id,
                    'ingredientName': ingredient.ingredient_name
                },
                'quantity': {
                    'quantityId': quantity.quantity_id,
                    'amount': quantity.quantity_amount
                },
                'unit': {
                    'unitId': unit.unit_id if unit else None,
                    'name': unit.unit_name if unit else ''
                }
            }
            
            if nutrition:
                ingredient_data['nutrition'] = nutrition
                
            data['recipeIngredients'].append(ingredient_data)
        
        # Add reviews
        reviews = Review.objects.filter(recipe_id=recipe_id)
        data['reviews'] = []
        
        for review in reviews:
            reviewer = review.user
            review_data = {
                'reviewId': review.review_id,
                'rating': review.rating,
                'comment': review.comment,
                'date': review.date_created.isoformat(),
                'user': {
                    'userId': reviewer.id,
                    'username': reviewer.username,
                    'firstName': reviewer.f_name,
                    'lastName': reviewer.l_name
                }
            }
            data['reviews'].append(review_data)
        
        return Response(data)
    
    def put(self, request, recipe_id):
        try:
            recipe = Recipe.objects.get(recipe_id=recipe_id)
        except Recipe.DoesNotExist:
            return Response({'message': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is the owner
        if request.user.id != recipe.user.id:
            return Response({'message': 'You do not have permission to edit this recipe'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = RecipeSerializer(recipe, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, recipe_id):
        try:
            recipe = Recipe.objects.get(recipe_id=recipe_id)
        except Recipe.DoesNotExist:
            return Response({'message': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is the owner
        if request.user.id != recipe.user.id:
            return Response({'message': 'You do not have permission to delete this recipe'}, status=status.HTTP_403_FORBIDDEN)
        
        recipe.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

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


#--------------CATEGORY VIEWS---------------#
class CategoryDetailView(APIView):
    def get(self, request, category_id):
        # try:
        #     category = Category.objects.get(category_id=category_id)
        # except Category.DoesNotExist:
        #     return Response({'message': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # serializer = CategorySerializer(category)
        # data = serializer.data
        
        # # Get recipes in this category
        # recipes = category.recipes.all()
        
        # recipe_serializer = RecipeListSerializer(recipes, many=True)
        # data['recipes'] = recipe_serializer.data
        cat = get_object_or_404(Category, category_id=category_id)

        base = CategorySerializer(cat).data

        queryset = cat.recipes.all()
        recipes = RecipeListSerializer(queryset, many=True).data

        base['recipes'] = recipes
        return Response(base)

#--------------SEARCH ENDPOINT---------------#
class SearchRecipesView(APIView):
    def get(self, request):
        search = request.query_params.get('q', '')
        
        if not search:
            return Response([])
        
        # Search in recipe names and descriptions
        recipes = Recipe.objects.filter(recipe_name__icontains=search) | Recipe.objects.filter(recipe_description__icontains=search)
        
        serializer = RecipeListSerializer(recipes, many=True)
        return Response(serializer.data)
