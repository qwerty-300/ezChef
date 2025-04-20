from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.contrib.auth.hashers import make_password
from .models import User, Recipe, Review, Category, RecipeIngredients, Ingredient, Unit, Quantity, Nutrition, Cookbook, AddRecipe

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


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('category_id', 'r_type', 'r_region')
        validators = [
            UniqueTogetherValidator(
                queryset=Category.objects.all(),
                fields = ['r_type', 'r_region'],
                message="That pair already exists."
            )
        ]


class RecipeSerializer(serializers.ModelSerializer):
    # Read-only
    category = CategorySerializer(read_only=True)
    r_type = serializers.CharField(source='category.r_type', read_only=True)
    r_region = serializers.CharField(source='category.r_region', read_only=True)
    # Allows clients to specify a category for their recipe
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Recipe
        fields = ('recipe_id', 'recipe_name', 'recipe_description', 'date_added', 'recipe_difficulty', 'r_type', 'r_region', 'category', 'category_id')

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('review', 'user_id', 'recipe_id', 'rating', 'comment', 'date_created')


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

class CookbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cookbook
        fields = ('cb_id', 'cb_title', 'cb_description', 'num_of_saves')
    
class AddRecipeSerializer(serializers.ModelSerializer):
    # Write-only
    recipe_id = serializers.PrimaryKeyRelatedField(
        queryset = Recipe.objects.all(),
        source='recipe',
        write_only=True
    )
    cb_id = serializers.PrimaryKeyRelatedField(
        queryset = Cookbook.objects.all(),
        source='cb',
        write_only=True
    )

        # read‑only outputs:
    recipe_name = serializers.CharField(
        source='recipe.recipe_name',
        read_only=True
    )
    cookbook = serializers.CharField(
        source='cb.cb_title',
        read_only=True
    )
    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    class Meta:
        model = AddRecipe
        fields = ('recipe_id', 'recipe_name', 'cb_id', 'cookbook', 'username')
        read_only_fields = ('user')
        validators = [
            UniqueTogetherValidator(
                queryset=AddRecipe.objects.all(),
                fields=('recipe', 'cb', 'user'),
                message="You've already added that recipe to this cookbook."
            )
        ]
