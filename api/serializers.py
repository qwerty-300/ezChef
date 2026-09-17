from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import (
    User, Recipe, Review, Category, RecipeIngredients, Ingredient,
    Unit, Quantity, Nutrition, Cookbook, AddRecipe, SubscribedCookbook,
)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    userId = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'userId', 'username', 'password', 'f_name', 'l_name', 'date_of_birth', 'email')

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        pwd = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if pwd:
            user.password = make_password(pwd)
            user.save()
        return user


class CategorySerializer(serializers.ModelSerializer):
    categoryId = serializers.IntegerField(source='category_id', read_only=True)
    catname = serializers.SerializerMethodField()
    r_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    r_region = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Category
        fields = ('categoryId', 'catname', 'r_type', 'r_region')

    def get_catname(self, obj):
        return obj.cat_name


class RecipeListSerializer(serializers.ModelSerializer):
    recipeId = serializers.IntegerField(source='recipe_id', read_only=True)
    name = serializers.CharField(source='recipe_name')
    description = serializers.CharField(source='recipe_description')
    dateAdded = serializers.DateField(source='date_added', read_only=True)
    difficulty = serializers.IntegerField(source='recipe_difficulty')
    category = serializers.SerializerMethodField()
    cat = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = (
            'recipeId', 'name', 'description', 'dateAdded', 'difficulty',
            'category', 'cat', 'reviews',
        )

    def get_category(self, obj):
        categories = list(obj.category.all())
        if obj.primary_category_id and obj.primary_category not in categories:
            categories.insert(0, obj.primary_category)
        return CategorySerializer(categories, many=True).data

    def get_cat(self, obj):
        return self.get_category(obj)

    def get_reviews(self, obj):
        out = []
        for rv in obj.review_set.all():
            out.append({
                'reviewId': rv.review_id,
                'rating': rv.rating,
                'comment': rv.comment,
                'date': rv.date_created.isoformat() if rv.date_created else None,
                'user': {
                    'userId': rv.user.id,
                    'username': rv.user.username,
                    'firstName': rv.user.f_name,
                    'lastName': rv.user.l_name,
                },
            })
        return out


class RecipeDetailSerializer(RecipeListSerializer):
    recipeIngredients = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()

    class Meta(RecipeListSerializer.Meta):
        fields = RecipeListSerializer.Meta.fields + ('recipeIngredients', 'user')

    def get_recipeIngredients(self, obj):
        out = []
        for ri in obj.recipeingredients_set.all():
            nutr = Nutrition.objects.filter(ingredient=ri.ingredient).first()
            out.append({
                'ingredient': {
                    'ingredientId': ri.ingredient.ingredient_id,
                    'ingredientName': ri.ingredient.ingredient_name,
                },
                'quantity': {
                    'quantityId': ri.quantity.quantity_id,
                    'amount': ri.quantity.quantity_amount,
                },
                'unit': {
                    'unitId': ri.unit.unit_id if ri.unit else None,
                    'name': ri.unit.unit_name if ri.unit else '',
                },
                'nutrition': {
                    'calorieCount': float(nutr.calorie_count or 0),
                    'proteinCount': float(nutr.protein_count or 0),
                } if nutr else None,
            })
        return out

    def get_user(self, obj):
        return {
            'userId': None,
            'username': 'Unknown',
            'firstName': '',
            'lastName': '',
        }


class RecipeIngredientsSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.ingredient_name')
    quantity_amount = serializers.ReadOnlyField(source='quantity.quantity_amount')
    unit_name = serializers.ReadOnlyField(source='unit.unit_name', default='')

    class Meta:
        model = RecipeIngredients
        fields = [
            'recipe', 'ingredient', 'ingredient_name', 'quantity',
            'quantity_amount', 'unit', 'unit_name',
        ]


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['ingredient_id', 'ingredient_name']


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ['unit_id', 'unit_name', 'symbol']


class QuantitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Quantity
        fields = ['quantity_id', 'quantity_amount']


class NutritionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nutrition
        fields = (
            'nutrition_id', 'protein_count', 'calorie_count',
            'ingredient', 'unit', 'serving_size',
        )


class CookbookSerializer(serializers.ModelSerializer):
    cookbookId = serializers.IntegerField(source='cb_id', read_only=True)
    title = serializers.CharField(source='cb_title')
    description = serializers.CharField(source='cb_description', allow_blank=True, required=False)
    creator = UserSerializer(read_only=True)
    recipes = serializers.SerializerMethodField()

    class Meta:
        model = Cookbook
        fields = ('cookbookId', 'cb_id', 'title', 'description', 'creator', 'recipes')

    def get_recipes(self, obj):
        recipes = Recipe.objects.filter(in_cookbooks__cb=obj).distinct()
        return RecipeListSerializer(recipes, many=True).data


class SubscribedCookbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscribedCookbook
        fields = '__all__'


class AddRecipeSerializer(serializers.ModelSerializer):
    recipe = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all())

    class Meta:
        model = AddRecipe
        fields = ('recipe',)


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    recipe_name = serializers.ReadOnlyField(source='recipe.recipe_name')

    class Meta:
        model = Review
        fields = (
            'review_id', 'user', 'username', 'recipe', 'recipe_name',
            'rating', 'comment', 'date_created',
        )
        read_only_fields = ('user', 'date_created')
