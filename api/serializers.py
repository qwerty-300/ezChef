from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.hashers import make_password
from .models import User, Recipe, Review, Category, RecipeIngredients, Ingredient, Unit, Quantity, Nutrition, Cookbook, AddRecipe, SubscribedCookbook


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
    
    def update(self, instance, validated_data):
        # If the user wants to change the password, hash it again
        pwd = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if pwd:
            user.set_password(pwd)
            user.save()
        return user

#---------------CATEGORY SERIALIZER---------------#
class CategorySerializer(serializers.ModelSerializer):
    categoryId = serializers.IntegerField(source='category_id')
    rtype = serializers.CharField(source="r_type")
    region = serializers.CharField(source="r_region")
    class Meta:
        model = Category
        fields = ('categoryId', 'rtype', 'region')

#---------------RECIPE SERIALIZER---------------#
class RecipeListSerializer(serializers.ModelSerializer):
    # category = serializers.PrimaryKeyRelatedField(
    #     queryset=Category.objects.all(), many=True
    # )
    # recipe_difficulty = serializers.IntegerField(
    #     validators=[MinValueValidator(1), MaxValueValidator(5)]
    # )
    # date_added = serializers.DateField()
    recipeId = serializers.IntegerField(source='recipe_id')
    name = serializers.CharField(source='recipe_name')
    description = serializers.CharField(source='recipe_description')
    dateAdded = serializers.DateField(source='date_added')
    difficulty  = serializers.IntegerField(source='recipe_difficulty')
    category    = CategorySerializer(many=True)

    class Meta:
        model = Recipe
        fields = ('recipeId', 'name', 'description', 'dateAdded', 'difficulty', 'category')
    
    # def create(self, validated_data):
    #     cat = validated_data.pop('category', [])
    #     recipe = super().create(validated_data)
    #     recipe.category.set(cat)
    #     return recipe
    
    # def update(self, instance, validated_data):
    #     cat = validated_data.pop('category', None)
    #     recipe = super().update(instance, validated_data)
    #     if cat is not None:
    #         recipe.category.set(cat)
    #     return recipe

class RecipeDetailSerializer(serializers.ModelSerializer):
    # reuse the list fields
    recipeId    = serializers.IntegerField(source="recipe_id")
    name        = serializers.CharField(source="recipe_name")
    description = serializers.CharField(source="recipe_description")
    dateAdded   = serializers.DateField(source="date_added")
    difficulty  = serializers.IntegerField(source="recipe_difficulty")
    category    = CategorySerializer(many=True)

    # nested ingredients
    recipeIngredients = serializers.SerializerMethodField()
    # nested reviews
    reviews = serializers.SerializerMethodField()
    # creator info
    user    = serializers.SerializerMethodField()

    class Meta:
        model  = Recipe
        fields = (
          "recipeId", "name", "description", "dateAdded", "difficulty",
          "category", "user", "recipeIngredients", "reviews"
        )

    def get_recipeIngredients(self, obj):
        out = []
        for ri in obj.recipeingredients_set.all():
            # fetch nutrition if any
            nutr = Nutrition.objects.filter(ingredient=ri.ingredient).first()
            out.append({
              "ingredient":      ri.ingredient.ingredient_name,
              "amount":          ri.quantity.quantity_amount,
              "unit":            ri.unit.unit_name if ri.unit else "",
              "nutrition":       {
                 "calorieCount": float(nutr.calorie_count or 0),
                 "proteinCount": float(nutr.protein_count or 0)
              } if nutr else None
            })
        return out

    def get_reviews(self, obj):
        out = []
        for rv in obj.review_set.all():
            out.append({
              "reviewId": rv.review_id,
              "rating":   rv.rating,
              "comment":  rv.comment,
              "date":     rv.date_created.isoformat(),
              "user": {
                "userId":    rv.user.id,
                "username":  rv.user.username,
                "firstName": rv.user.f_name,
                "lastName":  rv.user.l_name
              }
            })
        return out

    def get_user(self, obj):
        # assumes Recipe has a FK to User called `creator`
        c = getattr(obj, "creator", None)
        if not c:
            return {"userId": None, "username": "Unknown", "firstName": "", "lastName": ""}
        return {
          "userId":    c.id,
          "username":  c.username,
          "firstName": c.f_name,
          "lastName":  c.l_name
        }

#---------------RECIPE_INGREDIENTS SERIALIZER---------------#
class RecipeIngredientsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredients
        fields = ('recipe_id', 'ingredient_id', 'quantity_id', 'unit_id')

#---------------INGREDIENT SERIALIZER---------------#
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['ingredient_id', 'ingredient_name']

#---------------UNIT SERIALIZER---------------#
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

class RecipeIngredientsSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.ingredient_name')
    quantity_amount = serializers.ReadOnlyField(source='quantity.quantity_amount')
    unit_name = serializers.ReadOnlyField(source='unit.unit_name', default='')
    
    class Meta:
        model = RecipeIngredients
        fields = ['recipe', 'ingredient', 'ingredient_name', 'quantity', 'quantity_amount', 'unit', 'unit_name']

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    recipe_name = serializers.ReadOnlyField(source='recipe.recipe_name')
    
    class Meta:
        model = Review
        fields = ['review_id', 'user', 'username', 'recipe', 'recipe_name', 'rating', 'comment', 'date_created']

#---------------QUANTITY SERIALIZER---------------#
class QuantitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Quantity
        fields = ['quantity_id', 'quantity_amount']

#---------------NUTRITION SERIALIZER---------------#
class NutritionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nutrition
        fields = ('nutrition_id', 'protein_count', 'calorie_count', 'ingredient', 'unit', 'serving_size')

#---------------COOKBOOK SERIALIZER---------------#
class CookbookSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    subscribers = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Cookbook
        fields = ('cb_id', 'cb_title', 'cb_description', 'creator', 'subscribers')

#---------------SUBSCRIBED COOKBOOK SERIALIZER---------------#
class SubscribedCookbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscribedCookbook
        fields = '__all__'

#---------------ADD_RECIPE SERIALIZER---------------#    
class AddRecipeSerializer(serializers.ModelSerializer):
    recipe = serializers.PrimaryKeyRelatedField(
        queryset = Recipe.objects.all()
    )

    class Meta:
        model = AddRecipe
        fields = ('id', 'recipe')
        read_only_fields = ('id',)

#---------------REVIEW SERIALIZER---------------#
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('user', 'recipe', 'cookbook', 'rating', 'comment', 'date_created')

    def validate(self, data):
        user = data.get('user')
        recipe = data.get('recipe')
        cookbook = data.get('cookbook')

        if recipe and cookbook:
            raise serializers.ValidationError("Review cannot be linked to both a recipe and a cookbook.")
        if not recipe and not cookbook:
            raise serializers.ValidationError("Review must be linked to either a recipe or a cookbook.")

        if recipe and Review.objects.filter(user=user, recipe=recipe).exists():
            raise serializers.ValidationError("User has already reviewed this recipe.")
        if cookbook and Review.objects.filter(user=user, cookbook=cookbook).exists():
            raise serializers.ValidationError("User has already reviewed this cookbook.")

        return data
