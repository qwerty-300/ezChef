from rest_framework import serializers
from .models import User, Recipe, Review, Category, RecipeIngredients, Ingredient, Unit, Quantity, Nutrition

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'f_name', 'l_name', 'date_of_birth', 'email')

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ('recipe_id', 'recipe_name', 'recipe_description', 'date_added', 'recipe_difficulty')

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('review', 'user_id', 'recipe_id', 'rating', 'comment', 'date_created')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('category_id', 'category_name', 'category_description')

class RecipeIngredientsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredients
        fields = ('recipe_id', 'ingredient_id', 'quantity_id', 'unit_id')

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ('ingredient_id', 'ingredient_name')

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ('unit_id', 'unit_name', 'symbol')

class QuantitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Quantity
        fields = ('quantity_id', 'quantity_amount')

class NutritionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nutrition
        fields = ('nutrition_id', 'protein_count', 'calorie_count', 'ingredient', 'unit', 'serving_size')
