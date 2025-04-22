from rest_framework import serializers
from .models import Recipe, Category, Ingredient, Unit, Quantity, RecipeIngredient, Nutrition, Review, User, Cookbook

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'f_name', 'l_name', 'email']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['category_id', 'r_type', 'r_region']

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['ingredient_id', 'ingredient_name']

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ['unit_id', 'unit_name', 'symbol']

class NutritionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nutrition
        fields = ['nutrition_id', 'protein_count', 'calorie_count', 'serving_size']

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['recipe_id', 'recipe_name', 'recipe_description', 'date_added', 'recipe_difficulty']

class RecipeDetailSerializer(serializers.ModelSerializer):
    # Add related data for detailed view
    class Meta:
        model = Recipe
        fields = ['recipe_id', 'recipe_name', 'recipe_description', 'date_added', 'recipe_difficulty']

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.ingredient_name')
    quantity_amount = serializers.ReadOnlyField(source='quantity.quantity_amount')
    unit_name = serializers.ReadOnlyField(source='unit.unit_name', default='')
    
    class Meta:
        model = RecipeIngredient
        fields = ['recipe', 'ingredient', 'ingredient_name', 'quantity', 'quantity_amount', 'unit', 'unit_name']

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    recipe_name = serializers.ReadOnlyField(source='recipe.recipe_name')
    
    class Meta:
        model = Review
        fields = ['review_id', 'user', 'username', 'recipe', 'recipe_name', 'rating', 'comment', 'date_created']

class QuantitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Quantity
        fields = ['quantity_id', 'quantity_amount']

class CookbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cookbook
        fields = ['cb_id', 'cb_title', 'cb_description', 'num_of_saves']