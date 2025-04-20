from django.contrib import admin
from .models import Category, User, Recipe, RecipeIngredients, Ingredient, Quantity, Unit, Nutrition
# Register your models here.

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'f_name', 'l_name', 'email')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('category_id', 'r_type', 'r_region')


class RecipeIngredientsInline(admin.TabularInline):
    model = RecipeIngredients
    extra = 1

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('recipe_id', 'recipe_name', 'recipe_description', 'date_added', 'recipe_difficulty')
    inlines = [RecipeIngredientsInline]

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('ingredient_id', 'ingredient_name')

@admin.register(Quantity)
class QuantityAdmin(admin.ModelAdmin):
    list_display = ('quantity_id', 'quantity_amount')

@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('unit_id', 'unit_name', 'symbol')

@admin.register(Nutrition)
class NutritionAdmin(admin.ModelAdmin):
    list_display = ('nutrition_id', 'protein_count', 'calorie_count', 'ingredient', 'unit', 'serving_size')
