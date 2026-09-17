from django.db.models import Max, Q, Avg
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.hashers import make_password, check_password

from .serializers import (
    CategorySerializer, IngredientSerializer, NutritionSerializer,
    QuantitySerializer, RecipeIngredientsSerializer, UnitSerializer,
    UserSerializer, RecipeListSerializer, RecipeDetailSerializer,
    ReviewSerializer, CookbookSerializer, AddRecipeSerializer,
)
from .models import (
    User, Recipe, Review, Category, RecipeIngredients, Ingredient,
    Unit, Quantity, Nutrition, Cookbook, IdentifiedBy, AddRecipe,
)


class IsEzChefUser(permissions.BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        return bool(user and getattr(user, 'is_authenticated', False) and getattr(user, 'id', None))


def user_payload(user):
    return {
        'id': user.id,
        'userId': user.id,
        'username': user.username,
        'email': user.email,
        'f_name': user.f_name,
        'l_name': user.l_name,
    }


def get_or_create_quantity(amount):
    try:
        amount_int = int(round(float(amount)))
    except (TypeError, ValueError):
        amount_int = 0
    quantity = Quantity.objects.filter(quantity_amount=amount_int).first()
    if quantity:
        return quantity
    next_id = (Quantity.objects.aggregate(Max('quantity_id'))['quantity_id__max'] or 0) + 1
    return Quantity.objects.create(quantity_id=next_id, quantity_amount=amount_int)


def next_cookbook_id():
    return (Cookbook.objects.aggregate(Max('cb_id'))['cb_id__max'] or 0) + 1


def get_or_create_default_cookbook(user):
    cookbook = Cookbook.objects.filter(creator=user).order_by('cb_id').first()
    if cookbook:
        return cookbook
    return Cookbook.objects.create(
        cb_id=next_cookbook_id(),
        cb_title='My Cookbook',
        cb_description='Saved recipes',
        creator=user,
    )


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

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

        user = User(
            username=username,
            email=email,
            password=make_password(password),
            f_name=f_name,
            l_name=l_name,
        )
        user.save()

        from .jwt_utils import generate_tokens_for_user
        tokens = generate_tokens_for_user(user)

        return Response({
            'message': 'User registered successfully',
            'token': tokens['access'],
            'refresh': tokens['refresh'],
            'user': user_payload(user),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'message': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not (check_password(password, user.password) or user.password == password):
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        from .jwt_utils import generate_tokens_for_user
        tokens = generate_tokens_for_user(user)

        return Response({
            'message': 'Login successful',
            'token': tokens['access'],
            'refresh': tokens['refresh'],
            'user': user_payload(user),
        }, status=status.HTTP_200_OK)


class RefreshTokenView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'message': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

        from .jwt_utils import validate_token, generate_tokens_for_user
        payload = validate_token(refresh_token)
        if not payload:
            return Response({'message': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)

        tokens = generate_tokens_for_user(user)
        return Response({'access': tokens['access']}, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [IsEzChefUser]

    def get(self, request):
        return Response(user_payload(request.user), status=status.HTTP_200_OK)


class UserView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


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


class RecipeListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, category_id=None):
        sort = request.query_params.get('sort', 'newest')
        limit = request.query_params.get('limit', None)
        search = request.query_params.get('search', None)
        cat = request.query_params.get('cat_name', None)
        difficulty = request.query_params.get('difficulty', None)
        not_in_cookbook = request.query_params.get('notInCookbook', None)

        recipes = Recipe.objects.all().distinct()

        if category_id:
            recipes = recipes.filter(category__category_id=category_id)

        if search:
            recipes = recipes.filter(
                Q(recipe_name__icontains=search) | Q(recipe_description__icontains=search)
            )

        if cat:
            recipes = recipes.filter(
                Q(category__r_type__iexact=cat) | Q(category__r_region__iexact=cat)
            )

        if difficulty:
            recipes = recipes.filter(recipe_difficulty=difficulty)

        if not_in_cookbook:
            recipes = recipes.exclude(in_cookbooks__cb_id=not_in_cookbook)

        if sort == 'oldest':
            recipes = recipes.order_by('date_added')
        elif sort in ('popular', 'highest_rated'):
            recipes = recipes.annotate(avg_rating=Avg('review__rating')).order_by('-avg_rating', '-date_added')
        else:
            recipes = recipes.order_by('-date_added')

        if limit:
            recipes = recipes[:int(limit)]

        serializer = RecipeListSerializer(recipes, many=True)
        data = serializer.data
        for recipe in data:
            recipe['user'] = {
                'userId': None,
                'username': 'Unknown',
                'firstName': '',
                'lastName': '',
            }
        return Response(data)


class CreateRecipeView(APIView):
    permission_classes = [IsEzChefUser]

    def post(self, request):
        try:
            recipe_name = request.data.get('name') or request.data.get('recipe_name')
            recipe_description = request.data.get('description') or request.data.get('recipe_description') or ''
            recipe_difficulty = request.data.get('difficulty') or request.data.get('recipe_difficulty') or 3
            category_name = request.data.get('category') or request.data.get('categoryType')
            category_region = request.data.get('categoryRegion') or 'General'
            ingredients = request.data.get('ingredients', [])
            instructions = request.data.get('instructions')

            if not recipe_name:
                return Response({'message': 'Please provide a recipe name'}, status=status.HTTP_400_BAD_REQUEST)

            if instructions:
                recipe_description = f"{recipe_description}\n\nInstructions:\n{instructions}".strip()

            recipe = Recipe(
                recipe_name=recipe_name,
                recipe_description=recipe_description,
                recipe_difficulty=int(recipe_difficulty),
                date_added=timezone.now(),
            )
            recipe.save()

            if category_name:
                category, _ = Category.objects.get_or_create(
                    r_type=category_name,
                    r_region=category_region,
                )
                IdentifiedBy.objects.get_or_create(recipe=recipe, category=category)

            for ing_data in ingredients:
                if isinstance(ing_data.get('ingredient'), dict):
                    ingredient_name = ing_data['ingredient'].get('ingredientName') or ing_data['ingredient'].get('ingredient_name')
                    amount = (ing_data.get('quantity') or {}).get('amount', 0)
                    unit_name = (ing_data.get('unit') or {}).get('name') or (ing_data.get('unit') or {}).get('unit_name')
                    nutrition_data = ing_data.get('nutrition') or {}
                    calories = nutrition_data.get('calorieCount')
                    protein = nutrition_data.get('proteinCount')
                else:
                    ingredient_name = ing_data.get('name')
                    amount = ing_data.get('amount', 0)
                    unit_name = ing_data.get('unit')
                    calories = ing_data.get('calories')
                    protein = ing_data.get('protein')

                if not ingredient_name:
                    continue

                ingredient, _ = Ingredient.objects.get_or_create(ingredient_name=ingredient_name[:30])
                quantity = get_or_create_quantity(amount)

                unit = None
                if unit_name:
                    unit = Unit.objects.filter(unit_name=unit_name).first()
                    if unit is None:
                        unit = Unit.objects.create(unit_name=unit_name)

                RecipeIngredients.objects.get_or_create(
                    recipe=recipe,
                    ingredient=ingredient,
                    quantity=quantity,
                    defaults={'unit': unit},
                )

                if unit and (calories or protein) and not Nutrition.objects.filter(ingredient=ingredient).exists():
                    Nutrition.objects.create(
                        ingredient=ingredient,
                        calorie_count=calories or 0,
                        protein_count=protein or 0,
                        unit=unit,
                        serving_size=amount or 1,
                    )

            return Response(
                {'message': 'Recipe created successfully', 'recipeId': recipe.recipe_id},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            print(f"Error creating recipe: {str(e)}")
            return Response(
                {'message': 'An error occurred while creating the recipe'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RecipeDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, recipe_id):
        recipe = get_object_or_404(Recipe, recipe_id=recipe_id)
        return Response(RecipeDetailSerializer(recipe).data)

    def put(self, request, recipe_id):
        if not getattr(request.user, 'is_authenticated', False) or not getattr(request.user, 'id', None):
            return Response({'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        recipe = get_object_or_404(Recipe, recipe_id=recipe_id)
        serializer = RecipeListSerializer(recipe, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(RecipeDetailSerializer(recipe).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, recipe_id):
        if not getattr(request.user, 'is_authenticated', False) or not getattr(request.user, 'id', None):
            return Response({'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        recipe = get_object_or_404(Recipe, recipe_id=recipe_id)
        recipe.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserRecipesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id):
        recipes = Recipe.objects.filter(in_cookbooks__user_id=user_id).distinct()
        return Response(RecipeListSerializer(recipes, many=True).data)


class CookbookListCreateView(APIView):
    permission_classes = [IsEzChefUser]

    def get(self, request):
        cookbooks = Cookbook.objects.filter(
            Q(creator=request.user) | Q(subscribers=request.user)
        ).distinct()
        return Response(CookbookSerializer(cookbooks, many=True).data)

    def post(self, request):
        title = request.data.get('title') or request.data.get('cb_title')
        description = request.data.get('description') or request.data.get('cb_description') or ''
        if not title:
            return Response({'message': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
        cookbook = Cookbook.objects.create(
            cb_id=next_cookbook_id(),
            cb_title=title[:30],
            cb_description=description,
            creator=request.user,
        )
        return Response(CookbookSerializer(cookbook).data, status=status.HTTP_201_CREATED)


class UserCookbooksView(APIView):
    permission_classes = [IsEzChefUser]

    def get(self, request, user_id):
        cookbooks = Cookbook.objects.filter(
            Q(creator_id=user_id) | Q(subscribers__id=user_id)
        ).distinct()
        return Response(CookbookSerializer(cookbooks, many=True).data)


class CookbookDetailView(APIView):
    permission_classes = [IsEzChefUser]

    def get(self, request, cb_id):
        cookbook = get_object_or_404(Cookbook, cb_id=cb_id)
        return Response(CookbookSerializer(cookbook).data)

    def put(self, request, cb_id):
        return self.patch(request, cb_id)

    def patch(self, request, cb_id):
        cookbook = get_object_or_404(Cookbook, cb_id=cb_id)
        if cookbook.creator_id and cookbook.creator_id != request.user.id:
            return Response({'detail': 'You do not have permission to edit this cookbook.'}, status=status.HTTP_403_FORBIDDEN)
        title = request.data.get('title') or request.data.get('cb_title')
        description = request.data.get('description', request.data.get('cb_description', cookbook.cb_description))
        if title:
            cookbook.cb_title = title[:30]
        cookbook.cb_description = description
        cookbook.save()
        return Response(CookbookSerializer(cookbook).data)

    def delete(self, request, cb_id):
        cookbook = get_object_or_404(Cookbook, cb_id=cb_id)
        if cookbook.creator_id and cookbook.creator_id != request.user.id:
            return Response({'detail': 'You do not have permission to delete this cookbook.'}, status=status.HTTP_403_FORBIDDEN)
        cookbook.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CookbookRecipeView(APIView):
    permission_classes = [IsEzChefUser]

    def post(self, request, cb_id, recipe_id):
        cookbook = get_object_or_404(Cookbook, cb_id=cb_id)
        recipe = get_object_or_404(Recipe, recipe_id=recipe_id)
        AddRecipe.objects.get_or_create(user=request.user, cb=cookbook, recipe=recipe)
        return Response(CookbookSerializer(cookbook).data, status=status.HTTP_201_CREATED)

    def delete(self, request, cb_id, recipe_id):
        cookbook = get_object_or_404(Cookbook, cb_id=cb_id)
        AddRecipe.objects.filter(user=request.user, cb=cookbook, recipe_id=recipe_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SavedRecipeView(APIView):
    permission_classes = [IsEzChefUser]

    def get(self, request, user_id, recipe_id):
        exists = AddRecipe.objects.filter(user_id=user_id, recipe_id=recipe_id).exists()
        if not exists:
            return Response({'saved': False}, status=status.HTTP_404_NOT_FOUND)
        return Response({'saved': True})

    def post(self, request, user_id, recipe_id):
        cookbook = get_or_create_default_cookbook(request.user)
        recipe = get_object_or_404(Recipe, recipe_id=recipe_id)
        AddRecipe.objects.get_or_create(user=request.user, cb=cookbook, recipe=recipe)
        return Response({'saved': True, 'cookbookId': cookbook.cb_id}, status=status.HTTP_201_CREATED)

    def delete(self, request, user_id, recipe_id):
        AddRecipe.objects.filter(user=request.user, recipe_id=recipe_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReviewListCreateView(APIView):
    permission_classes = [IsEzChefUser]

    def get(self, request):
        reviews = Review.objects.filter(user=request.user)
        return Response(ReviewSerializer(reviews, many=True).data)

    def post(self, request):
        recipe_id = request.data.get('recipe') or request.data.get('recipeId')
        rating = request.data.get('rating')
        comment = request.data.get('comment')
        if not recipe_id or not rating:
            return Response({'message': 'Recipe and rating are required'}, status=status.HTTP_400_BAD_REQUEST)

        recipe = get_object_or_404(Recipe, recipe_id=recipe_id)
        review = Review.objects.filter(user=request.user, recipe=recipe).first()
        if review:
            review.rating = rating
            review.comment = comment
            review.save()
        else:
            review = Review.objects.create(
                user=request.user,
                recipe=recipe,
                rating=rating,
                comment=comment,
                date_created=timezone.now(),
            )
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


class RecipeReviewListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, recipe_id):
        reviews = Review.objects.filter(recipe_id=recipe_id)
        return Response(ReviewSerializer(reviews, many=True).data)


class CategoryDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, category_id):
        cat = get_object_or_404(Category, category_id=category_id)
        base = CategorySerializer(cat).data
        base['recipes'] = RecipeListSerializer(cat.recipes.all(), many=True).data
        return Response(base)


class SearchRecipesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        search = request.query_params.get('q') or request.query_params.get('search', '')
        if not search:
            return Response([])
        recipes = Recipe.objects.filter(
            Q(recipe_name__icontains=search) | Q(recipe_description__icontains=search)
        ).distinct()
        return Response(RecipeListSerializer(recipes, many=True).data)
