from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.hashers import make_password
from .models import User, Recipe, Review, Category, RecipeIngredients, Ingredient, Unit, Quantity, Nutrition, Cookbook, AddRecipe

#---------------USER SERIALIZER---------------#
class UserSerializer(serializers.ModelSerializer):
    # Password should be write-only
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'f_name', 'l_name', 'date_of_birth', 'email')

    def create(self, validated_data):
        # Hashes the password before saving it
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    
    def update(self, instance, validated_date):
        # If the user wants to change the password, hash it again
        pwd = validated_data.pop('password', None)
        user = super().updated(instance, validated_data)
        if pwd:
            user.set_password(pwd)
            user.save()
        return user


#---------------CATEGORY SERIALIZER---------------#
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('category_id', 'r_type', 'r_region')


#---------------RECIPE SERIALIZER---------------#
class RecipeSerializer(serializers.ModelSerializer):
    # Read-only
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), many=True
    )
    recipe_difficulty = serializers.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    date_added = serializers.DateField()

    class Meta:
        model = Recipe
        fields = ('recipe_id', 'recipe_name', 'recipe_description', 'date_added', 'recipe_difficulty', 'category')
    
    def create(self, validated_data):
        cat = validated_data.pop('category', [])
        recipe = super().create(validated_data)
        recipe.category.set(cat)
        return recipe
    
    def update(self, instance, validated_data):
        cat = validated_data.pop('category', None)
        recipe = super().update(instance, validated_data)
        if cat is not None:
            recipe.category.set(cat)
        return recipe


#---------------RECIPE_INGREDIENTS SERIALIZER---------------#
class RecipeIngredientsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredients
        fields = ('recipe_id', 'ingredient_id', 'quantity_id', 'unit_id')

#---------------INGREDIENT SERIALIZER---------------#
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ('ingredient_id', 'ingredient_name')


#---------------UNIT SERIALIZER---------------#
class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ('unit_id', 'unit_name', 'symbol')


#---------------QUANTITY SERIALIZER---------------#
class QuantitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Quantity
        fields = ('quantity_id', 'quantity_amount')


#---------------NUTRITION SERIALIZER---------------#
class NutritionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nutrition
        fields = ('nutrition_id', 'protein_count', 'calorie_count', 'ingredient', 'unit', 'serving_size')


#---------------COOKBOOK SERIALIZER---------------#
class CookbookSerializer(serializers.ModelSerializer):
    num_of_saves = serializers.IntegerField(read_only=True)
    class Meta:
        model = Cookbook
        fields = ('cb_id', 'cb_title', 'cb_description', 'num_of_saves')


#---------------ADD_RECIPE SERIALIZER---------------#    
class AddRecipeSerializer(serializers.ModelSerializer):
    recipe = serializers.PrimaryKeyRelatedField(
        queryset = Recipe.objects.all()
    )

    class Meta:
        model = AddRecipe
        fields = ('id', 'recipe')
        read_only_fields = ('id')


#---------------REVIEW SERIALIZER---------------#
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('review', 'user_id', 'recipe_id', 'rating', 'comment', 'date_created')
